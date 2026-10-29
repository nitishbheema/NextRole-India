package com.nextrole.security;

import com.nextrole.enums.RiskLabel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UrlSecurityValidatorTest {

    private UrlSecurityValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UrlSecurityValidator();
    }

    @Test
    @DisplayName("SSRF Defense: Blocks localhost and loopback IPs immediately")
    void testBlocksLoopbackIp() {
        UrlSecurityValidator.SecurityScanResult result = validator.validateUrl("http://127.0.0.1:8080/admin", "https://mycompany.com");

        assertThat(result.riskLabel()).isEqualTo(RiskLabel.MALICIOUS);
        assertThat(result.threatScore()).isEqualTo(100);
        assertThat(result.riskFlags()).anyMatch(f -> f.contains("SSRF_VIOLATION"));
    }

    @Test
    @DisplayName("SSRF Defense: Blocks cloud metadata IP (169.254.169.254)")
    void testBlocksCloudMetadataIp() {
        UrlSecurityValidator.SecurityScanResult result = validator.validateUrl("http://169.254.169.254/latest/meta-data/", "https://mycompany.com");

        assertThat(result.riskLabel()).isEqualTo(RiskLabel.MALICIOUS);
        assertThat(result.threatScore()).isEqualTo(100);
        assertThat(result.riskFlags()).anyMatch(f -> f.contains("SSRF_VIOLATION"));
    }

    @Test
    @DisplayName("SSRF Defense: Blocks private network IPs (10.0.0.1, 192.168.1.1)")
    void testBlocksPrivateIps() {
        UrlSecurityValidator.SecurityScanResult result = validator.validateUrl("http://192.168.1.50:9000/internal", "https://mycompany.com");

        assertThat(result.riskLabel()).isEqualTo(RiskLabel.MALICIOUS);
        assertThat(result.riskFlags()).anyMatch(f -> f.contains("SSRF_VIOLATION"));
    }

    @Test
    @DisplayName("Protocol restriction: Blocks non-http/https protocols such as file://, gopher://")
    void testBlocksDisallowedProtocols() {
        UrlSecurityValidator.SecurityScanResult result = validator.validateUrl("file:///etc/passwd", "https://mycompany.com");

        assertThat(result.riskLabel()).isEqualTo(RiskLabel.MALICIOUS);
        assertThat(result.riskFlags()).anyMatch(f -> f.contains("DISALLOWED_PROTOCOL"));
    }

    @Test
    @DisplayName("Lookalike check: Detects punycode homograph domain")
    void testDetectsPunycodeHomograph() {
        UrlSecurityValidator.SecurityScanResult result = validator.validateUrl("https://xn--pple-43d.com/careers", "https://apple.com");

        assertThat(result.riskFlags()).anyMatch(f -> f.contains("PUNYCODE_HOMOGRAPH_DOMAIN"));
        assertThat(result.threatScore()).isGreaterThanOrEqualTo(50);
    }

    @Test
    @DisplayName("Domain Trust: Recognized verified ATS domain is marked as trusted")
    void testRecognizedAtsDomain() {
        UrlSecurityValidator.SecurityScanResult result = validator.validateUrl("https://boards.greenhouse.io/thoughtworks/jobs/123", "https://thoughtworks.com");

        // Should not have domain mismatch flag
        assertThat(result.riskFlags()).noneMatch(f -> f.contains("DOMAIN_MISMATCH"));
    }

    @Test
    @DisplayName("Domain Mismatch: Unrelated third-party domain is flagged")
    void testUnrelatedThirdPartyDomainFlagged() {
        UrlSecurityValidator.SecurityScanResult result = validator.validateUrl("https://suspicious-unknown-site.xyz/apply", "https://mycompany.com");

        assertThat(result.riskFlags()).anyMatch(f -> f.contains("DOMAIN_MISMATCH"));
    }
}
