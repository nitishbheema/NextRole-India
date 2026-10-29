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
import java.util.ArrayList;
import java.util.List;

/**
 * Adapter for the Ashby public job board GraphQL API.
 * Endpoint: https://jobs.ashbyhq.com/api/non-user-graphql (POST)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AshbyAdapter implements JobSourceAdapter {

    private static final String ASHBY_API_URL = "https://jobs.ashbyhq.com/api/non-user-graphql";
    private static final String ASHBY_JOB_BOARD_BASE = "https://jobs.ashbyhq.com";

    private static final String GRAPHQL_QUERY = """
            query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) {
              jobBoard: publishedJobBoard(organizationHostedJobsPageName: $organizationHostedJobsPageName) {
                jobPostings {
                  id
                  title
                  locationName
                  descriptionHtml
                  employmentType
                  isListed
                  externalLink
                }
              }
            }
            """;

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    @Override
    public SourceType getSourceType() {
        return SourceType.ASHBY;
    }

    @Override
    public List<NormalizedJob> fetchJobs(JobSource source) throws Exception {
        int maxRetries = appProperties.getSync().getMaxRetries();
        long retryDelayMs = appProperties.getSync().getRetryDelayMs();

        Exception lastException = null;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.debug("Ashby fetch attempt {}/{} for board: {}", attempt, maxRetries, source.getBoardIdentifier());
                List<NormalizedJob> jobs = doFetch(source.getBoardIdentifier());
                log.info("Ashby: fetched {} jobs for board: {}", jobs.size(), source.getBoardIdentifier());
                return jobs;
            } catch (Exception e) {
                lastException = e;
                log.warn("Ashby fetch attempt {}/{} failed for board {}: {}", attempt, maxRetries, source.getBoardIdentifier(), e.getMessage());
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
        throw new Exception("Ashby fetch failed after " + maxRetries + " attempts for board: " + source.getBoardIdentifier(), lastException);
    }

    private List<NormalizedJob> doFetch(String boardIdentifier) throws Exception {
        // Build GraphQL request body
        var variables = objectMapper.createObjectNode();
        variables.put("organizationHostedJobsPageName", boardIdentifier);

        var body = objectMapper.createObjectNode();
        body.put("operationName", "ApiJobBoardWithTeams");
        body.set("variables", variables);
        body.put("query", GRAPHQL_QUERY);

        String requestBody = objectMapper.writeValueAsString(body);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(appProperties.getSync().getHttpTimeoutSeconds()))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ASHBY_API_URL))
                .timeout(Duration.ofSeconds(appProperties.getSync().getReadTimeoutSeconds()))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .header("User-Agent", "NextRole-India-Bot/1.0")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new Exception("Ashby API returned HTTP " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode jobPostings = root.path("data").path("jobBoard").path("jobPostings");

        List<NormalizedJob> normalized = new ArrayList<>();
        if (jobPostings.isArray()) {
            for (JsonNode posting : jobPostings) {
                try {
                    NormalizedJob job = normalizePosting(posting, boardIdentifier);
                    if (job != null) {
                        normalized.add(job);
                    }
                } catch (Exception e) {
                    log.warn("Failed to normalize Ashby posting: {}", e.getMessage());
                }
            }
        }
        return normalized;
    }

    public NormalizedJob normalizePosting(JsonNode node, String boardIdentifier) {
        // Skip unlisted jobs
        boolean isListed = node.path("isListed").asBoolean(true);
        if (!isListed) {
            return null;
        }

        String id = node.path("id").asText("").trim();
        if (id.isBlank()) {
            return null;
        }

        String title = node.path("title").asText("").trim();
        String locationName = node.path("locationName").asText("").trim();
        String descriptionHtml = node.path("descriptionHtml").asText("");
        String employmentType = node.path("employmentType").asText("");
        String externalLink = node.path("externalLink").asText("");

        // Apply URL: use externalLink if present, else construct Ashby board URL
        String applyUrl = (externalLink != null && !externalLink.isBlank())
                ? externalLink
                : ASHBY_JOB_BOARD_BASE + "/" + boardIdentifier + "/" + id;

        String sourceUrl = ASHBY_JOB_BOARD_BASE + "/" + boardIdentifier + "/" + id;
        String country = detectCountry(locationName);

        return new NormalizedJob(
                id,
                title,
                descriptionHtml,
                locationName,
                country,
                mapEmploymentType(employmentType, title),
                inferExperienceLevel(title),
                inferWorkMode(locationName, title),
                applyUrl,
                sourceUrl,
                null, // Ashby doesn't expose publishedAt in this query
                false // isListed=false already filtered out above
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

    private JobType mapEmploymentType(String employmentType, String title) {
        if (employmentType != null) {
            String lower = employmentType.toLowerCase();
            if (lower.contains("intern")) return JobType.INTERNSHIP;
            if (lower.contains("contract") || lower.contains("freelance")) return JobType.CONTRACT;
            if (lower.contains("part")) return JobType.PART_TIME;
            if (lower.contains("full")) return JobType.FULL_TIME;
        }
        // Fall back to title inference
        String tLower = title.toLowerCase();
        if (tLower.contains("intern")) return JobType.INTERNSHIP;
        if (tLower.contains("contract")) return JobType.CONTRACT;
        if (tLower.contains("part-time") || tLower.contains("part time")) return JobType.PART_TIME;
        if (tLower.contains("apprentice")) return JobType.APPRENTICESHIP;
        return JobType.FULL_TIME;
    }

    private ExperienceLevel inferExperienceLevel(String title) {
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
        if (combined.contains("onsite") || combined.contains("on-site")) return WorkMode.ONSITE;
        return WorkMode.NOT_SPECIFIED;
    }

    @Override
    public boolean isHealthy(JobSource source) {
        try {
            var variables = objectMapper.createObjectNode();
            variables.put("organizationHostedJobsPageName", source.getBoardIdentifier());

            var body = objectMapper.createObjectNode();
            body.put("operationName", "ApiJobBoardWithTeams");
            body.set("variables", variables);
            body.put("query", "query ApiJobBoardWithTeams($organizationHostedJobsPageName: String!) { jobBoard: publishedJobBoard(organizationHostedJobsPageName: $organizationHostedJobsPageName) { id } }");

            String requestBody = objectMapper.writeValueAsString(body);

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ASHBY_API_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() < 500;
        } catch (Exception e) {
            log.debug("Ashby health check failed for {}: {}", source.getBoardIdentifier(), e.getMessage());
            return false;
        }
    }
}
