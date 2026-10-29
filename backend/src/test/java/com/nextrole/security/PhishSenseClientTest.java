package com.nextrole.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.enums.RiskLabel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PhishSenseClientTest {

    private PhishSenseClient client;
    private UrlSecurityValidator fallbackValidator;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        fallbackValidator = new UrlSecurityValidator();
        // Point to unreachable localhost port to trigger fallback handling gracefully
        client = new PhishSenseClient("http://127.0.0.1:54321", "test-key", objectMapper, fallbackValidator);
    }

    @Test
    @DisplayName("When live API is unreachable, gracefully falls back to internal security engine")
    void testFallbackWhenLiveApiUnreachable() {
        PhishSenseClient.PhishSenseScanResult result = client.scanUrl(
                "https://boards.greenhouse.io/thoughtworks/jobs/55",
                "https://thoughtworks.com"
        );

        assertThat(result).isNotNull();
        assertThat(result.isLiveApiCall()).isFalse();
        assertThat(result.source()).contains("Fallback");
        assertThat(result.riskLabel()).isEqualTo(RiskLabel.LOW_RISK);
    }

    @Test
    @DisplayName("Empty URL returns MALICIOUS result without throwing unhandled exceptions")
    void testEmptyUrlHandling() {
        PhishSenseClient.PhishSenseScanResult result = client.scanUrl("", "https://company.com");

        assertThat(result.riskLabel()).isEqualTo(RiskLabel.MALICIOUS);
        assertThat(result.threatScore()).isEqualTo(100);
    }
}
