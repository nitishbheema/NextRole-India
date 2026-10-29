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
    @DisplayName("Should decode entity-encoded Thoughtworks HTML descriptions")
    void normalizeThoughtworksEntityEncodedHtml() {
        String thoughtworksRaw = """
                &lt;div class=&quot;description content&quot;&gt;
                &lt;p&gt;We are looking for an &lt;strong&gt;Agentic AI Principal&lt;/strong&gt; to act as a senior technical authority.&lt;/p&gt;
                &lt;/div&gt;
                &lt;h2 id=&quot;job-responsibilities&quot;&gt;Job responsibilities&lt;/h2&gt;
                &lt;div class=&quot;job-responsibilities content&quot;&gt;
                &lt;ul&gt;
                &lt;li&gt;&lt;strong&gt;Agentic AI Advisory:&lt;/strong&gt; Shape enterprise AI strategy.&lt;/li&gt;
                &lt;li&gt;&lt;strong&gt;Design &amp;amp; Build:&lt;/strong&gt; Set architecture direction.&lt;/li&gt;
                &lt;/ul&gt;
                &lt;/div&gt;
                &lt;h2 id=&quot;job-qualifications&quot;&gt;Job qualifications&lt;/h2&gt;
                &lt;div class=&quot;job-qualifications content&quot;&gt;
                &lt;h3 id=&quot;technical-skills&quot;&gt;Technical Skills&lt;/h3&gt;
                &lt;ul&gt;
                &lt;li&gt;Deep expertise in modern software engineering and Python.&lt;/li&gt;
                &lt;/ul&gt;
                &lt;/div&gt;
                """;

        String clean = HtmlDescriptionSanitizer.sanitize(thoughtworksRaw);

        // Verify HTML tags are NOT escaped as literal text
        assertThat(clean).doesNotContain("&lt;div");
        assertThat(clean).doesNotContain("&lt;h2");
        assertThat(clean).doesNotContain("&lt;p&gt;");
        assertThat(clean).doesNotContain("&lt;ul&gt;");
        assertThat(clean).doesNotContain("&lt;li&gt;");

        // Verify genuine HTML tags are preserved
        assertThat(clean).contains("<h2 id=\"job-responsibilities\">Job responsibilities</h2>");
        assertThat(clean).contains("<h2 id=\"job-qualifications\">Job qualifications</h2>");
        assertThat(clean).contains("<h3 id=\"technical-skills\">Technical Skills</h3>");
        assertThat(clean).contains("<ul>");
        assertThat(clean).contains("<li><strong>Agentic AI Advisory:</strong> Shape enterprise AI strategy.</li>");
        assertThat(clean).contains("<li>Deep expertise in modern software engineering and Python.</li>");
    }

    @Test
    @DisplayName("Should unescape backslash-escaped HTML tags (e.g. \\<div>, \\<p>, \\<h2>, \\<ul>, \\<li>)")
    void unescapeBackslashEscapedTags() {
        String backslashEscaped = """
                \\<div>
                \\<p>Join our core engineering platform team.\\</p>
                \\<h2>Job responsibilities\\</h2>
                \\<ul>
                \\<li>Architect resilient microservices in Java and Go.\\</li\\>
                \\<li>Conduct peer code reviews and mentor junior developers.\\</li\\>
                \\</ul>
                \\<h2>Job qualifications\\</h2>
                \\<p>Bachelor's degree in Computer Science or related field.\\</p>
                \\</div>
                """;

        String clean = HtmlDescriptionSanitizer.sanitize(backslashEscaped);

        assertThat(clean).doesNotContain("\\<");
        assertThat(clean).doesNotContain("\\>");
        assertThat(clean).contains("<h2>Job responsibilities</h2>");
        assertThat(clean).contains("<h2>Job qualifications</h2>");
        assertThat(clean).contains("<ul>");
        assertThat(clean).contains("<li>Architect resilient microservices in Java and Go.</li>");
        assertThat(clean).contains("<li>Conduct peer code reviews and mentor junior developers.</li>");
        assertThat(clean).contains("<p>Join our core engineering platform team.</p>");
    }

    @Test
    @DisplayName("Should fix markdown links in href and escaped target attributes")
    void fixMarkdownInHrefAndEscapedTargets() {
        String input = """
                <p>Read our engineering handbook: <a href="[https://thoughtworks.com/careers](https://thoughtworks.com/careers)" target="\\_blank">Careers Page</a></p>
                """;

        String clean = HtmlDescriptionSanitizer.sanitize(input);

        assertThat(clean).contains("href=\"https://thoughtworks.com/careers\"");
        assertThat(clean).contains("target=\"_blank\"");
        assertThat(clean).contains("rel=\"noopener noreferrer\"");
        assertThat(clean).doesNotContain("[https://");
        assertThat(clean).doesNotContain("\\_blank");
    }

    @Test
    @DisplayName("Should convert plain-text descriptions with paragraphs and bullet lists into semantic HTML")
    void convertPlainTextInput() {
        String plainText = """
                We are hiring a Senior Software Engineer for Bengaluru.

                Key Responsibilities:
                • Build high throughput streaming pipelines with Kafka
                • Optimize PostgreSQL queries for sub-second responses
                • Maintain 99.99% service availability

                Qualifications:
                • 5+ years of Java / Spring Boot experience
                • Strong algorithmic background
                """;

        String clean = HtmlDescriptionSanitizer.sanitize(plainText);

        assertThat(clean).contains("<p>We are hiring a Senior Software Engineer for Bengaluru.</p>");
        assertThat(clean).contains("<ul>");
        assertThat(clean).contains("<li>Build high throughput streaming pipelines with Kafka</li>");
        assertThat(clean).contains("<li>Optimize PostgreSQL queries for sub-second responses</li>");
        assertThat(clean).contains("<li>5+ years of Java / Spring Boot experience</li>");
    }

    @Test
    @DisplayName("Should strictly remove dangerous scripts, styles, and event handlers")
    void removeDangerousTagsAndScripts() {
        String dangerous = """
                <p>Normal text</p>
                <script>alert('malicious')</script>
                <style>body { display: none; }</style>
                <img src="x" onerror="alert('xss')" />
                <a href="javascript:alert('steal')">Click me</a>
                <a href="https://example.com/apply" onclick="stealCookies()">Apply</a>
                """;

        String clean = HtmlDescriptionSanitizer.sanitize(dangerous);

        assertThat(clean).doesNotContain("script");
        assertThat(clean).doesNotContain("alert");
        assertThat(clean).doesNotContain("style");
        assertThat(clean).doesNotContain("onerror");
        assertThat(clean).doesNotContain("onclick");
        assertThat(clean).doesNotContain("javascript:");
        assertThat(clean).contains("<p>Normal text</p>");
        assertThat(clean).contains("<a href=\"https://example.com/apply\" target=\"_blank\" rel=\"noopener noreferrer\">Apply</a>");
    }

    @Test
    @DisplayName("Should preserve safe math comparisons and non-HTML angle brackets in text")
    void preserveOrdinaryText() {
        String input = "<p>Candidate should have > 3 years experience and salary <= 15 LPA.</p>";
        String clean = HtmlDescriptionSanitizer.sanitize(input);
        assertThat(clean).contains("&gt; 3 years experience and salary &lt;= 15 LPA.");
    }
}
