package com.nextrole.util;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.parser.Parser;
import org.jsoup.safety.Safelist;
import org.jsoup.select.Elements;

import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility for normalizing and sanitizing HTML & plain-text job descriptions.
 * Handles entity-escaped HTML (such as Greenhouse feeds), backslash-escaped tags,
 * markdown-in-attribute anomalies, and plain text, while strictly stripping unsafe
 * scripts, styles, event handlers, and invalid protocols.
 */
public final class HtmlDescriptionSanitizer {

    // Matches escaped HTML tags like \<p>, \<div>, \</h2>, \<br />, etc.
    private static final Pattern ESCAPED_TAG_PATTERN = Pattern.compile(
            "\\\\<(/?[a-zA-Z][a-zA-Z0-9:-]*(?:\\s+[^>]*?)?)\\\\?>|\\\\<(/?[a-zA-Z][a-zA-Z0-9:-]*)\\\\?>"
    );

    // Matches closing angle brackets that were escaped: \>
    private static final Pattern ESCAPED_CLOSE_BRACKET = Pattern.compile("\\\\>");

    // Matches target="\_blank" or target="\\_blank"
    private static final Pattern ESCAPED_TARGET_PATTERN = Pattern.compile(
            "target=([\"'])\\\\+(_[a-zA-Z]+)([\"'])",
            Pattern.CASE_INSENSITIVE
    );

    // Matches markdown-formatted links embedded in href attributes: href="[https://...](https://...)"
    private static final Pattern MARKDOWN_IN_HREF_PATTERN = Pattern.compile(
            "href=([\"'])\\s*\\[(?:[^\\]]*)\\]\\((https?://[^)\\s\"']+)\\)\\s*([\"'])",
            Pattern.CASE_INSENSITIVE
    );

    // Checks if the string contains entity-encoded HTML tags: e.g. &lt;div, &lt;p&gt;, &lt;h2
    private static final Pattern ENTITY_ENCODED_TAG_PATTERN = Pattern.compile(
            "&lt;\\s*/?(?:div|p|h[1-6]|ul|ol|li|strong|b|em|i|u|br|a|span|section|article|blockquote|table|tr|td|th)\\b",
            Pattern.CASE_INSENSITIVE
    );

    // Checks if string contains standard HTML tags
    private static final Pattern ANY_HTML_TAG_PATTERN = Pattern.compile(
            "</?[a-zA-Z][a-zA-Z0-9:-]*(?:\\s+[^>]*)?>",
            Pattern.CASE_INSENSITIVE
    );

    private static final Safelist SAFELIST = Safelist.relaxed()
            .addTags("h1", "h2", "h3", "h4", "h5", "h6", "hr")
            .addAttributes("a", "target", "rel", "title")
            .addAttributes("span", "class")
            .addAttributes("div", "class", "id")
            .addAttributes("h1", "id", "class")
            .addAttributes("h2", "id", "class")
            .addAttributes("h3", "id", "class")
            .addAttributes("h4", "id", "class")
            .addAttributes("h5", "id", "class")
            .addAttributes("h6", "id", "class")
            .addAttributes("th", "colspan", "rowspan", "scope")
            .addAttributes("td", "colspan", "rowspan")
            .removeProtocols("a", "href", "javascript", "data", "vbscript", "file")
            .addProtocols("a", "href", "http", "https", "mailto");

    private static final Document.OutputSettings OUTPUT_SETTINGS = new Document.OutputSettings()
            .prettyPrint(true)
            .syntax(Document.OutputSettings.Syntax.html)
            .charset(StandardCharsets.UTF_8);

    private HtmlDescriptionSanitizer() {
    }

    /**
     * Normalizes and sanitizes a job description, returning clean, secure HTML.
     */
    public static String sanitize(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        // 1. First normalize raw string anomalies (backslashes, markdown links in href, escaped targets)
        String normalized = normalizeRawText(input);

        // 2. Detect and unescape entity-encoded HTML tags if present (e.g. Greenhouse API &lt;div...&gt;)
        if (ENTITY_ENCODED_TAG_PATTERN.matcher(normalized).find()) {
            normalized = Parser.unescapeEntities(normalized, false);
            // Re-apply normalization in case unescaped entities revealed escaped targets or backslashes
            normalized = normalizeRawText(normalized);
        }

        // 3. Handle pure plain-text descriptions (e.g. from plain-text feeds or employer manual submissions)
        if (!ANY_HTML_TAG_PATTERN.matcher(normalized).find()) {
            normalized = convertPlainTextToHtml(normalized);
        }

        // 4. Sanitize with Jsoup Safelist
        String cleanHtml = Jsoup.clean(normalized, "", SAFELIST, OUTPUT_SETTINGS);

        // 5. Post-process elements (ensure safe external link attributes)
        Document doc = Jsoup.parseBodyFragment(cleanHtml);
        Elements links = doc.select("a[href]");
        for (Element link : links) {
            link.attr("target", "_blank");
            link.attr("rel", "noopener noreferrer");
        }

        return doc.body().html().trim();
    }

    /**
     * Unescapes backslash-escaped tags and fixes attribute formatting glitches.
     */
    private static String normalizeRawText(String input) {
        if (input == null) return "";

        String text = input;

        // Fix markdown links in href: href="[https://example.com](https://example.com)" -> href="https://example.com"
        text = MARKDOWN_IN_HREF_PATTERN.matcher(text).replaceAll("href=$1$2$3");

        // Fix target="\_blank" -> target="_blank"
        text = ESCAPED_TARGET_PATTERN.matcher(text).replaceAll("target=$1$2$3");

        // Fix \<tag> or \<tag\> -> <tag>
        Matcher tagMatcher = ESCAPED_TAG_PATTERN.matcher(text);
        StringBuilder sb = new StringBuilder();
        while (tagMatcher.find()) {
            String tagContent = tagMatcher.group(1) != null ? tagMatcher.group(1) : tagMatcher.group(2);
            tagMatcher.appendReplacement(sb, Matcher.quoteReplacement("<" + tagContent + ">"));
        }
        tagMatcher.appendTail(sb);
        text = sb.toString();

        // Fix stray closing \>
        text = ESCAPED_CLOSE_BRACKET.matcher(text).replaceAll(">");

        return text;
    }

    /**
     * Converts plain text with paragraphs and list bullets into semantic HTML.
     */
    private static String convertPlainTextToHtml(String plainText) {
        if (plainText == null || plainText.isBlank()) {
            return "";
        }

        // Standardize line breaks
        String text = plainText.replace("\r\n", "\n").replace("\r", "\n");
        String[] lines = text.split("\n");
        StringBuilder html = new StringBuilder();

        java.util.List<String> currentBullets = new java.util.ArrayList<>();
        java.util.List<String> currentParagraph = new java.util.ArrayList<>();

        Runnable flushBullets = () -> {
            if (!currentBullets.isEmpty()) {
                html.append("<ul>\n");
                for (String bullet : currentBullets) {
                    html.append("  <li>").append(Parser.escapeEntities(bullet, OUTPUT_SETTINGS)).append("</li>\n");
                }
                html.append("</ul>\n");
                currentBullets.clear();
            }
        };

        Runnable flushParagraph = () -> {
            if (!currentParagraph.isEmpty()) {
                html.append("<p>");
                for (int i = 0; i < currentParagraph.size(); i++) {
                    if (i > 0) html.append("<br>");
                    html.append(Parser.escapeEntities(currentParagraph.get(i), OUTPUT_SETTINGS));
                }
                html.append("</p>\n");
                currentParagraph.clear();
            }
        };

        for (String rawLine : lines) {
            String trimmedLine = rawLine.trim();
            if (trimmedLine.isEmpty()) {
                flushParagraph.run();
                flushBullets.run();
                continue;
            }

            if (trimmedLine.startsWith("•") || trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
                flushParagraph.run();
                String clean = trimmedLine.replaceFirst("^[•\\-\\*]\\s*", "").trim();
                if (!clean.isEmpty()) {
                    currentBullets.add(clean);
                }
            } else {
                flushBullets.run();
                currentParagraph.add(trimmedLine);
            }
        }
        flushParagraph.run();
        flushBullets.run();

        return html.toString();
    }
}
