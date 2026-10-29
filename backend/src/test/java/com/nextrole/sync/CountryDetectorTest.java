package com.nextrole.sync;

import com.nextrole.sync.util.CountryDetector;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CountryDetectorTest {

    @Test
    @DisplayName("Blank or null location must never be classified as India")
    void testBlankOrNullLocation() {
        assertThat(CountryDetector.detectCountry(null)).isEqualTo("Unknown");
        assertThat(CountryDetector.detectCountry("")).isEqualTo("Unknown");
        assertThat(CountryDetector.detectCountry("   ")).isEqualTo("Unknown");
    }

    @Test
    @DisplayName("Generic remote location must not be assumed as India")
    void testGenericRemoteLocation() {
        assertThat(CountryDetector.detectCountry("Remote")).isEqualTo("Remote");
        assertThat(CountryDetector.detectCountry("Worldwide")).isEqualTo("Remote");
        assertThat(CountryDetector.detectCountry("Work From Home")).isEqualTo("Remote");
        assertThat(CountryDetector.detectCountry("Global Remote")).isEqualTo("Remote");
        assertThat(CountryDetector.detectCountry("Anywhere")).isEqualTo("Remote");
    }

    @Test
    @DisplayName("Foreign remote territory must be classified as foreign, never India")
    void testForeignRemoteTerritory() {
        assertThat(CountryDetector.detectCountry("Remote - US")).isEqualTo("United States");
        assertThat(CountryDetector.detectCountry("Remote (Americas)")).isEqualTo("Americas");
        assertThat(CountryDetector.detectCountry("Remote - EMEA")).isEqualTo("EMEA");
        assertThat(CountryDetector.detectCountry("Remote - UK")).isEqualTo("United Kingdom");
        assertThat(CountryDetector.detectCountry("Remote, Germany")).isEqualTo("Germany");
    }

    @Test
    @DisplayName("Explicit India remote must be classified as India")
    void testIndiaRemote() {
        assertThat(CountryDetector.detectCountry("Remote - India")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Remote (India)")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("India - Remote")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Work from Home (India)")).isEqualTo("India");
    }

    @Test
    @DisplayName("Indian cities and tech hubs correctly classified as India")
    void testIndianTechHubs() {
        assertThat(CountryDetector.detectCountry("Bengaluru, Karnataka, India")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Bangalore")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Hyderabad, Telangana")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Pune, Maharashtra")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Chennai, Tamil Nadu")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Mumbai, Maharashtra")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Gurugram, Haryana")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Noida, Uttar Pradesh")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("New Delhi")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Kochi, Kerala")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Kolkata")).isEqualTo("India");
    }

    @Test
    @DisplayName("Foreign tech hubs and countries correctly preserved and not classified as India")
    void testForeignLocations() {
        assertThat(CountryDetector.detectCountry("Hamburg, Germany")).isEqualTo("Germany");
        assertThat(CountryDetector.detectCountry("Munich, Germany")).isEqualTo("Germany");
        assertThat(CountryDetector.detectCountry("London, United Kingdom")).isEqualTo("United Kingdom");
        assertThat(CountryDetector.detectCountry("Singapore, Singapore")).isEqualTo("Singapore");
        assertThat(CountryDetector.detectCountry("San Francisco, CA")).isNotEqualTo("India");
        assertThat(CountryDetector.detectCountry("Amsterdam, Netherlands")).isEqualTo("Netherlands");
        assertThat(CountryDetector.detectCountry("Bucharest, Romania")).isEqualTo("Romania");
    }

    @Test
    @DisplayName("Structured country parameter honored when location is generic")
    void testStructuredCountryParameter() {
        assertThat(CountryDetector.detectCountry("Engineering", "India")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry("Engineering", "Germany")).isEqualTo("Germany");
        assertThat(CountryDetector.detectCountry(null, "IN")).isEqualTo("India");
        assertThat(CountryDetector.detectCountry(null, "DE")).isNotEqualTo("India");
    }
}
