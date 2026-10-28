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
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/**
 * Adapter for the Greenhouse public job board API.
 * Endpoint: https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GreenhouseAdapter implements JobSourceAdapter {

    private static final String API_BASE = "https://boards-api.greenhouse.io/v1/boards/%s/jobs?content=true";
    private static final DateTimeFormatter GH_DATE_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    @Override
    public SourceType getSourceType() {
        return SourceType.GREENHOUSE;
    }

    @Override
    public List<NormalizedJob> fetchJobs(JobSource source) throws Exception {
        String url = String.format(API_BASE, source.getBoardIdentifier());
        int maxRetries = appProperties.getSync().getMaxRetries();
        long retryDelayMs = appProperties.getSync().getRetryDelayMs();
        int timeoutSeconds = appProperties.getSync().getHttpTimeoutSeconds();

        Exception lastException = null;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.debug("Greenhouse fetch attempt {}/{} for board: {}", attempt, maxRetries, source.getBoardIdentifier());
                List<NormalizedJob> jobs = doFetch(url, timeoutSeconds);
                log.info("Greenhouse: fetched {} jobs for board: {}", jobs.size(), source.getBoardIdentifier());
                return jobs;
            } catch (Exception e) {
                lastException = e;
                log.warn("Greenhouse fetch attempt {}/{} failed for board {}: {}", attempt, maxRetries, source.getBoardIdentifier(), e.getMessage());
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(retryDelayMs * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw ie;
                    }
                }
            }
        }
        throw new Exception("Greenhouse fetch failed after " + maxRetries + " attempts for board: " + source.getBoardIdentifier(), lastException);
    }

    private List<NormalizedJob> doFetch(String url, int timeoutSeconds) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(timeoutSeconds))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(appProperties.getSync().getReadTimeoutSeconds()))
                .header("Accept", "application/json")
                .header("User-Agent", "NextRole-India-Bot/1.0")
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new Exception("Greenhouse API returned HTTP " + response.statusCode() + " for URL: " + url);
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode jobsNode = root.path("jobs");

        List<NormalizedJob> normalized = new ArrayList<>();
        if (jobsNode.isArray()) {
            for (JsonNode jobNode : jobsNode) {
                try {
                    NormalizedJob job = normalizeJob(jobNode);
                    if (job != null) {
                        normalized.add(job);
                    }
                } catch (Exception e) {
                    log.warn("Failed to normalize Greenhouse job node: {}", e.getMessage());
                }
            }
        }
        return normalized;
    }

    NormalizedJob normalizeJob(JsonNode node) {
        String id = node.path("id").asText();
        if (id.isBlank()) {
            return null;
        }

        String title = node.path("title").asText("").trim();
        String absoluteUrl = node.path("absolute_url").asText("");
        String content = node.path("content").asText(""); // HTML description

        // Location
        String location = "";
        JsonNode locationNode = node.path("location");
        if (!locationNode.isMissingNode()) {
            location = locationNode.path("name").asText("").trim();
        }

        // Country detection
        String country = detectCountry(location);

        // Published at
        LocalDateTime publishedAt = null;
        String updatedAt = node.path("updated_at").asText("");
        if (!updatedAt.isBlank()) {
            try {
                publishedAt = LocalDateTime.parse(updatedAt, GH_DATE_FORMATTER);
            } catch (DateTimeParseException e) {
                log.debug("Cannot parse Greenhouse date: {}", updatedAt);
            }
        }

        // Greenhouse public API doesn't expose "closed" state — if a job appears, it's open
        return new NormalizedJob(
                id,
                title,
                content,
                location,
                country,
                inferJobType(title, node),
                inferExperienceLevel(title, node),
                inferWorkMode(location, title),
                absoluteUrl,
                absoluteUrl,
                publishedAt,
                false
        );
    }

    private String detectCountry(String location) {
        if (location == null || location.isBlank()) {
            return "India";
        }
        String lower = location.toLowerCase();
        if (lower.contains("india") || lower.contains("bengaluru") || lower.contains("bangalore")
                || lower.contains("mumbai") || lower.contains("delhi") || lower.contains("hyderabad")
                || lower.contains("pune") || lower.contains("chennai") || lower.contains("kolkata")
                || lower.contains("gurgaon") || lower.contains("noida")) {
            return "India";
        }
        return location;
    }

    private JobType inferJobType(String title, JsonNode node) {
        String lower = title.toLowerCase();
        if (lower.contains("intern")) return JobType.INTERNSHIP;
        if (lower.contains("contract")) return JobType.CONTRACT;
        if (lower.contains("part-time") || lower.contains("part time")) return JobType.PART_TIME;
        if (lower.contains("apprentice")) return JobType.APPRENTICESHIP;
        if (lower.contains("graduate programme") || lower.contains("graduate program")) return JobType.GRADUATE_PROGRAMME;
        return JobType.FULL_TIME;
    }

    private ExperienceLevel inferExperienceLevel(String title, JsonNode node) {
        String lower = title.toLowerCase();
        if (lower.contains("intern") || lower.contains("fresher") || lower.contains("entry level")
                || lower.contains("entry-level") || lower.contains("graduate")) {
            return ExperienceLevel.FRESHER;
        }
        if (lower.contains("junior") || lower.contains("associate")) return ExperienceLevel.JUNIOR;
        if (lower.contains("senior") || lower.contains("sr.") || lower.contains("sr ")) return ExperienceLevel.SENIOR;
        if (lower.contains("lead") || lower.contains("principal") || lower.contains("staff")) return ExperienceLevel.LEAD;
        if (lower.contains("director") || lower.contains("vp") || lower.contains("head of")
                || lower.contains("chief") || lower.contains("executive")) {
            return ExperienceLevel.EXECUTIVE;
        }
        return ExperienceLevel.NOT_SPECIFIED;
    }

    private WorkMode inferWorkMode(String location, String title) {
        String combined = (location + " " + title).toLowerCase();
        if (combined.contains("remote")) return WorkMode.REMOTE;
        if (combined.contains("hybrid")) return WorkMode.HYBRID;
        if (combined.contains("onsite") || combined.contains("on-site") || combined.contains("in office")
                || combined.contains("in-office")) {
            return WorkMode.ONSITE;
        }
        return WorkMode.NOT_SPECIFIED;
    }

    @Override
    public boolean isHealthy(JobSource source) {
        String url = String.format(API_BASE, source.getBoardIdentifier());
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            return response.statusCode() < 500;
        } catch (Exception e) {
            log.debug("Greenhouse health check failed for board {}: {}", source.getBoardIdentifier(), e.getMessage());
            return false;
        }
    }
}
