package com.nextrole.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.enums.RiskLabel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class PhishSenseClient {

    private final String baseUrl;
    private final String apiKey;
    private final ObjectMapper objectMapper;
    private final UrlSecurityValidator fallbackValidator;

    public PhishSenseClient(
            @Value("${phishsense.base-url:https://phishense-backend.onrender.com}") String baseUrl,
            @Value("${phishsense.api-key:}") String apiKey,
            ObjectMapper objectMapper,
            UrlSecurityValidator fallbackValidator
    ) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.fallbackValidator = fallbackValidator;
    }

    public record PhishSenseScanResult(
            RiskLabel riskLabel,
            int threatScore,
            List<String> flags,
            String source,
            boolean isLiveApiCall
    ) {}

    public PhishSenseScanResult scanUrl(String url, String companyWebsite) {
        if (url == null || url.isBlank()) {
            return new PhishSenseScanResult(RiskLabel.MALICIOUS, 100, List.of("EMPTY_URL"), "PhishSense Validator", false);
        }

        // Try live PhishSense API
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(4))
                    .build();

            String scanEndpoint = baseUrl + "/api/scan";
            String requestBody = objectMapper.writeValueAsString(new ScanRequest(url));

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(scanEndpoint))
                    .timeout(Duration.ofSeconds(5))
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "NextRole-India/1.0 (+https://nextrole-india.onrender.com)")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody));

            if (apiKey != null && !apiKey.isBlank()) {
                reqBuilder.header("Authorization", "Bearer " + apiKey);
            }

            HttpResponse<String> response = client.send(reqBuilder.build(), HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode json = objectMapper.readTree(response.body());
                String labelStr = json.path("label").asText("LEGIT").toUpperCase();
                int threatScore = json.path("threat_score").asInt(0);

                List<String> flags = new ArrayList<>();
                JsonNode flagsNode = json.path("flags");
                if (flagsNode.isArray()) {
                    for (JsonNode f : flagsNode) {
                        flags.add(f.asText());
                    }
                }

                RiskLabel label;
                if ("PHISHING".equalsIgnoreCase(labelStr) || threatScore >= 60) {
                    label = RiskLabel.MALICIOUS;
                } else if ("SUSPICIOUS".equalsIgnoreCase(labelStr) || threatScore >= 30) {
                    label = RiskLabel.SUSPICIOUS;
                } else {
                    label = RiskLabel.LOW_RISK;
                }

                log.info("PhishSense live scan successful for {}: label={}, score={}", url, label, threatScore);
                return new PhishSenseScanResult(label, threatScore, flags, "PhishSense Live API", true);
            } else {
                log.warn("PhishSense API returned HTTP {} for URL {}", response.statusCode(), url);
            }
        } catch (Exception e) {
            log.info("PhishSense live API unavailable or timed out ({}); using resilient internal heuristic engine", e.getMessage());
        }

        // Fallback to internal heuristic & SSRF validator
        UrlSecurityValidator.SecurityScanResult fallback = fallbackValidator.validateUrl(url, companyWebsite);
        return new PhishSenseScanResult(
                fallback.riskLabel(),
                fallback.threatScore(),
                fallback.riskFlags(),
                "PhishSense Fallback Engine (" + fallback.scannerSource() + ")",
                false
        );
    }

    private record ScanRequest(String url) {}
}
