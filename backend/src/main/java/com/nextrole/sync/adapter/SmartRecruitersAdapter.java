package com.nextrole.sync.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.config.AppProperties;
import com.nextrole.entity.JobSource;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.SourceType;
import com.nextrole.enums.WorkMode;
import com.nextrole.sync.model.NormalizedJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Adapter for the SmartRecruiters public postings API.
 * Endpoint: https://api.smartrecruiters.com/v1/companies/{companyIdentifier}/postings
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SmartRecruitersAdapter implements JobSourceAdapter {

    private static final String API_BASE = "https://api.smartrecruiters.com/v1/companies/%s/postings";
    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    @Override
    public SourceType getSourceType() {
        return SourceType.SMARTRECRUITERS;
    }

    @Override
    public List<NormalizedJob> fetchJobs(JobSource source) throws Exception {
        String url = String.format(API_BASE, source.getBoardIdentifier());
        int maxRetries = appProperties.getSync().getMaxRetries();
        long retryDelayMs = appProperties.getSync().getRetryDelayMs();
        int httpTimeoutSec = appProperties.getSync().getHttpTimeoutSeconds();

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(httpTimeoutSec))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(httpTimeoutSec))
                .header("User-Agent", "NextRole-India-JobBot/1.0 (+https://nextrole-india.onrender.com)")
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = null;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    break;
                } else if (response.statusCode() == 404) {
                    throw new Exception("SmartRecruiters company identifier not found: " + source.getBoardIdentifier());
                } else if (response.statusCode() == 429) {
                    log.warn("SmartRecruiters rate limited (429) on attempt {} for company {}", attempt, source.getBoardIdentifier());
                    Thread.sleep(retryDelayMs * (1L << attempt));
                } else {
                    log.warn("SmartRecruiters returned HTTP {} on attempt {} for company {}", response.statusCode(), attempt, source.getBoardIdentifier());
                    Thread.sleep(retryDelayMs * attempt);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new Exception("Interrupted while fetching SmartRecruiters jobs", e);
            } catch (Exception e) {
                lastException = e;
                if (attempt < maxRetries) {
                    Thread.sleep(retryDelayMs * attempt);
                }
            }
        }

        if (response == null || response.statusCode() != 200) {
            String errorMsg = response != null ? "HTTP " + response.statusCode() : (lastException != null ? lastException.getMessage() : "Unknown error");
            throw new Exception("Failed to fetch SmartRecruiters jobs for " + source.getBoardIdentifier() + ": " + errorMsg);
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode contentNode = root.path("content");

        List<NormalizedJob> normalized = new ArrayList<>();
        if (contentNode.isArray()) {
            for (JsonNode jobNode : contentNode) {
                try {
                    NormalizedJob job = normalizePosting(jobNode, source.getBoardIdentifier());
                    if (job != null) {
                        normalized.add(job);
                    }
                } catch (Exception e) {
                    log.warn("Failed to normalize SmartRecruiters job: {}", e.getMessage());
                }
            }
        }
        return normalized;
    }

    public NormalizedJob normalizePosting(JsonNode node, String boardIdentifier) {
        String id = node.path("id").asText("").trim();
        if (id.isBlank()) {
            return null;
        }

        String title = node.path("name").asText("").trim();
        if (title.isBlank()) {
            return null;
        }

        // Location
        JsonNode locationNode = node.path("location");
        String city = locationNode.path("city").asText("").trim();
        String country = locationNode.path("country").asText("").trim();
        String location = !city.isBlank() ? city + ", " + country : country;

        // Apply URL
        String applyUrl = String.format("https://jobs.smartrecruiters.com/%s/%s", boardIdentifier, id);

        // Released date
        LocalDateTime publishedAt = null;
        String releasedDate = node.path("releasedDate").asText("");
        if (!releasedDate.isBlank()) {
            try {
                publishedAt = LocalDateTime.parse(releasedDate, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            } catch (Exception ignored) {
            }
        }

        JobType jobType = detectJobType(node.path("typeOfEmployment").path("label").asText(""));
        ExperienceLevel experienceLevel = detectExperienceLevel(title);
        WorkMode workMode = detectWorkMode(title + " " + location);

        return new NormalizedJob(
                id,
                title,
                "",
                location,
                detectCountry(location),
                jobType,
                experienceLevel,
                workMode,
                applyUrl,
                applyUrl,
                publishedAt,
                false
        );
    }

    private String detectCountry(String location) {
        if (location == null) return "India";
        String lower = location.toLowerCase();
        if (lower.contains("india") || lower.contains("bengaluru") || lower.contains("bangalore") ||
                lower.contains("hyderabad") || lower.contains("pune") || lower.contains("chennai") ||
                lower.contains("mumbai") || lower.contains("delhi") || lower.contains("noida") || lower.contains("gurugram")) {
            return "India";
        }
        return "Global";
    }

    private JobType detectJobType(String raw) {
        String lower = raw.toLowerCase();
        if (lower.contains("intern")) return JobType.INTERNSHIP;
        if (lower.contains("contract") || lower.contains("temp")) return JobType.CONTRACT;
        if (lower.contains("part")) return JobType.PART_TIME;
        if (lower.contains("graduate") || lower.contains("trainee")) return JobType.GRADUATE_PROGRAMME;
        return JobType.FULL_TIME;
    }

    private ExperienceLevel detectExperienceLevel(String title) {
        String lower = title.toLowerCase();
        if (lower.contains("intern")) return ExperienceLevel.FRESHER;
        if (lower.contains("graduate") || lower.contains("trainee") || lower.contains("junior") || lower.contains("entry") || lower.contains("associate")) {
            return ExperienceLevel.FRESHER;
        }
        if (lower.contains("senior") || lower.contains("sr.") || lower.contains("lead") || lower.contains("staff")) {
            return ExperienceLevel.SENIOR;
        }
        return ExperienceLevel.MID;
    }

    private WorkMode detectWorkMode(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("remote") || lower.contains("work from home")) return WorkMode.REMOTE;
        if (lower.contains("hybrid")) return WorkMode.HYBRID;
        return WorkMode.ONSITE;
    }
}
