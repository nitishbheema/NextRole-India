package com.nextrole.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility for sanitizing HTML descriptions from job sources into structured,
 * safe text while preserving headings, paragraphs, and bullet lists.
 */
public final class HtmlDescriptionSanitizer {

    private static final Pattern SCRIPT_STYLE_PATTERN = Pattern.compile(
            "<(script|style|iframe|object|embed)[^>]*?>.*?</\\1>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private static final Pattern HEADING_PATTERN = Pattern.compile(
            "<h[1-6][^>]*>(.*?)</h[1-6]>",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );

    private static final Pattern LI_PATTERN = Pattern.compile(
            "<li[^>]*>",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern BR_PATTERN = Pattern.compile(
            "<br\\s*/?>",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern BLOCK_PATTERN = Pattern.compile(
            "</?(p|div|tr|ul|ol|table|section|article)[^>]*>",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ALL_TAGS_PATTERN = Pattern.compile(
            "<[^>]+>"
    );

    private static final Pattern DECIMAL_ENTITY_PATTERN = Pattern.compile("&#([0-9]+);");
    private static final Pattern HEX_ENTITY_PATTERN = Pattern.compile("&#x([0-9a-fA-F]+);");

    private HtmlDescriptionSanitizer() {
    }

    public static String sanitize(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        // 1. Remove dangerous blocks and their contents
        String text = SCRIPT_STYLE_PATTERN.matcher(input).replaceAll("");

        // 2. Standardize carriage returns
        text = text.replace("\r\n", "\n").replace("\r", "\n");

        // 3. Format headings with markdown-style indicators
        Matcher headingMatcher = HEADING_PATTERN.matcher(text);
        StringBuilder headingBuffer = new StringBuilder();
        while (headingMatcher.find()) {
            String inner = headingMatcher.group(1).replaceAll("<[^>]+>", "").trim();
            headingMatcher.appendReplacement(headingBuffer, Matcher.quoteReplacement("\n\n### " + inner + "\n\n"));
        }
        headingMatcher.appendTail(headingBuffer);
        text = headingBuffer.toString();

        // 4. Preserve bullet points from <li> tags
        text = LI_PATTERN.matcher(text).replaceAll("\n• ");

        // 5. Convert <br> to newline
        text = BR_PATTERN.matcher(text).replaceAll("\n");

        // 6. Convert common block boundaries to newlines
        text = BLOCK_PATTERN.matcher(text).replaceAll("\n\n");

        // 7. Strip all remaining HTML tags
        text = ALL_TAGS_PATTERN.matcher(text).replaceAll(" ");

        // 8. Decode HTML entities
        text = decodeHtmlEntities(text);

        // 9. Clean up whitespace: trim lines and collapse excessive line breaks
        String[] lines = text.split("\n");
        StringBuilder cleaned = new StringBuilder();
        int consecutiveEmptyLines = 0;

        for (String line : lines) {
            String trimmed = line.trim().replaceAll("[ \\t]{2,}", " ");
            if (trimmed.isEmpty()) {
                consecutiveEmptyLines++;
                if (consecutiveEmptyLines <= 2) {
                    cleaned.append("\n");
                }
            } else {
                consecutiveEmptyLines = 0;
                if (cleaned.length() > 0 && cleaned.charAt(cleaned.length() - 1) != '\n') {
                    cleaned.append("\n");
                }
                cleaned.append(trimmed).append("\n");
            }
        }

        return cleaned.toString().trim();
    }

    private static String decodeHtmlEntities(String input) {
        if (input == null || !input.contains("&")) {
            return input;
        }

        String text = input
                .replace("&amp;", "&")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&quot;", "\"")
                .replace("&#39;", "'")
                .replace("&apos;", "'")
                .replace("&nbsp;", " ")
                .replace("&bull;", "•")
                .replace("&middot;", "·")
                .replace("&ndash;", "–")
                .replace("&mdash;", "—")
                .replace("&rsquo;", "'")
                .replace("&lsquo;", "'")
                .replace("&rdquo;", "\"")
                .replace("&ldquo;", "\"");

        // Decode decimal entities &#123;
        Matcher decMatcher = DECIMAL_ENTITY_PATTERN.matcher(text);
        StringBuilder decBuffer = new StringBuilder();
        while (decMatcher.find()) {
            try {
                int codePoint = Integer.parseInt(decMatcher.group(1));
                decMatcher.appendReplacement(decBuffer, Matcher.quoteReplacement(new String(Character.toChars(codePoint))));
            } catch (Exception e) {
                decMatcher.appendReplacement(decBuffer, "");
            }
        }
        decMatcher.appendTail(decBuffer);
        text = decBuffer.toString();

        // Decode hex entities &#x1F;
        Matcher hexMatcher = HEX_ENTITY_PATTERN.matcher(text);
        StringBuilder hexBuffer = new StringBuilder();
        while (hexMatcher.find()) {
            try {
                int codePoint = Integer.parseInt(hexMatcher.group(1), 16);
                hexMatcher.appendReplacement(hexBuffer, Matcher.quoteReplacement(new String(Character.toChars(codePoint))));
            } catch (Exception e) {
                hexMatcher.appendReplacement(hexBuffer, "");
            }
        }
        hexMatcher.appendTail(hexBuffer);

        return hexBuffer.toString();
    }
}
