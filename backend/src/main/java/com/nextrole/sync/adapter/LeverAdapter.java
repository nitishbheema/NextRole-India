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
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

/**
 * Adapter for the Lever public job postings API.
 * Endpoint: https://api.lever.co/v0/postings/{company}?mode=json
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LeverAdapter implements JobSourceAdapter {

    private static final String API_BASE = "https://api.lever.co/v0/postings/%s?mode=json";

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    @Override
    public SourceType getSourceType() {
        return SourceType.LEVER;
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
                log.debug("Lever fetch attempt {}/{} for company: {}", attempt, maxRetries, source.getBoardIdentifier());
                List<NormalizedJob> jobs = doFetch(url, timeoutSeconds, source.getBoardIdentifier());
                log.info("Lever: fetched {} jobs for company: {}", jobs.size(), source.getBoardIdentifier());
                return jobs;
            } catch (Exception e) {
                lastException = e;
                log.warn("Lever fetch attempt {}/{} failed for company {}: {}", attempt, maxRetries, source.getBoardIdentifier(), e.getMessage());
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
        throw new Exception("Lever fetch failed after " + maxRetries + " attempts for company: " + source.getBoardIdentifier(), lastException);
    }

    private List<NormalizedJob> doFetch(String url, int timeoutSeconds, String company) throws Exception {
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
            throw new Exception("Lever API returned HTTP " + response.statusCode() + " for URL: " + url);
        }

        JsonNode root = objectMapper.readTree(response.body());

        List<NormalizedJob> normalized = new ArrayList<>();
        if (root.isArray()) {
            for (JsonNode posting : root) {
                try {
                    NormalizedJob job = normalizePosting(posting, company);
                    if (job != null) {
                        normalized.add(job);
                    }
                } catch (Exception e) {
                    log.warn("Failed to normalize Lever posting: {}", e.getMessage());
                }
            }
        }
        return normalized;
    }

    NormalizedJob normalizePosting(JsonNode node, String company) {
        String id = node.path("id").asText("").trim();
        if (id.isBlank()) {
            return null;
        }

        String state = node.path("state").asText("published");
        boolean isClosed = "closed".equalsIgnoreCase(state);

        String title = node.path("text").asText("").trim();
        String descriptionPlain = node.path("descriptionPlain").asText("");
        String hostedUrl = node.path("hostedUrl").asText("");

        // Categories
        JsonNode categories = node.path("categories");
        String location = categories.path("location").asText("").trim();
        String team = categories.path("team").asText("");
        String commitment = categories.path("commitment").asText("");

        String country = detectCountry(location);

        // Published at (Lever uses epoch milliseconds)
        LocalDateTime publishedAt = null;
        long createdAt = node.path("createdAt").asLong(0);
        if (createdAt > 0) {
            publishedAt = LocalDateTime.ofInstant(Instant.ofEpochMilli(createdAt), ZoneOffset.UTC);
        }

        return new NormalizedJob(
                id,
                title,
                descriptionPlain,
                location,
                country,
                inferJobType(title, commitment),
                inferExperienceLevel(title, commitment),
                inferWorkMode(location, title),
                hostedUrl,
                hostedUrl,
                publishedAt,
                isClosed
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

    private JobType inferJobType(String title, String commitment) {
        String lower = (title + " " + commitment).toLowerCase();
        if (lower.contains("intern")) return JobType.INTERNSHIP;
        if (lower.contains("contract") || lower.contains("freelance")) return JobType.CONTRACT;
        if (lower.contains("part-time") || lower.contains("part time")) return JobType.PART_TIME;
        if (lower.contains("apprentice")) return JobType.APPRENTICESHIP;
        if (lower.contains("graduate programme") || lower.contains("graduate program")) return JobType.GRADUATE_PROGRAMME;
        return JobType.FULL_TIME;
    }

    private ExperienceLevel inferExperienceLevel(String title, String commitment) {
        String lower = (title + " " + commitment).toLowerCase();
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
        if (combined.contains("onsite") || combined.contains("on-site")) return WorkMode.ONSITE;
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
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() < 500;
        } catch (Exception e) {
            log.debug("Lever health check failed for {}: {}", source.getBoardIdentifier(), e.getMessage());
            return false;
        }
    }
}
