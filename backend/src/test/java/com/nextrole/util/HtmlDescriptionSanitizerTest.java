package com.nextrole.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class HtmlDescriptionSanitizerTest {

    @Test
    @DisplayName("Should handle null, blank, and empty input")
    void handleNullOrBlank() {
        assertThat(HtmlDescriptionSanitizer.sanitize(null)).isEmpty();
        assertThat(HtmlDescriptionSanitizer.sanitize("")).isEmpty();
        assertThat(HtmlDescriptionSanitizer.sanitize("   \n\t  ")).isEmpty();
    }

    @Test
    @DisplayName("Should preserve paragraphs and line breaks")
    void preserveParagraphs() {
        String html = "<p>First paragraph about the role.</p><p>Second paragraph with details.</p>";
        String result = HtmlDescriptionSanitizer.sanitize(html);
        assertThat(result).contains("First paragraph about the role.");
        assertThat(result).contains("Second paragraph with details.");
        assertThat(result).contains("\n\n");
    }

    @Test
    @DisplayName("Should convert list items to bullet points")
    void convertListItemsToBullets() {
        String html = "<ul><li>Java 21 experience</li><li>Spring Boot mastery</li><li>PostgreSQL knowledge</li></ul>";
        String result = HtmlDescriptionSanitizer.sanitize(html);
        assertThat(result).contains("• Java 21 experience");
        assertThat(result).contains("• Spring Boot mastery");
        assertThat(result).contains("• PostgreSQL knowledge");
    }

    @Test
    @DisplayName("Should format headings with markdown-style indicators")
    void formatHeadings() {
        String html = "<h3>Role Responsibilities</h3><p>Build scalable backend systems.</p><h4>Requirements</h4>";
        String result = HtmlDescriptionSanitizer.sanitize(html);
        assertThat(result).contains("### Role Responsibilities");
        assertThat(result).contains("### Requirements");
        assertThat(result).contains("Build scalable backend systems.");
    }

    @Test
    @DisplayName("Should decode HTML entities properly")
    void decodeEntities() {
        String html = "<p>Salary &amp; Perks: &gt; &#8377;12,00,000 &bull; Remote &quot;first&quot; &#39;friendly&#39; &nbsp; company.</p>";
        String result = HtmlDescriptionSanitizer.sanitize(html);
        assertThat(result).contains("Salary & Perks: > ₹12,00,000 • Remote \"first\" 'friendly' company.");
    }

    @Test
    @DisplayName("Should remove dangerous script and style tags completely")
    void removeDangerousTags() {
        String html = "<p>Safe text</p><script>alert('xss');</script><style>.hidden { display: none; }</style><p>More safe text</p>";
        String result = HtmlDescriptionSanitizer.sanitize(html);
        assertThat(result).doesNotContain("alert");
        assertThat(result).doesNotContain("script");
        assertThat(result).doesNotContain("hidden");
        assertThat(result).contains("Safe text");
        assertThat(result).contains("More safe text");
    }
}
