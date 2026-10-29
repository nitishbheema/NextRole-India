package com.nextrole.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Robust, format-tolerant deserializer for LocalDateTime that gracefully accepts:
 * 1. ISO-8601 UTC timestamps with 'Z' (e.g. "2026-11-30T00:00:00.000Z")
 * 2. ISO-8601 timestamps with offset (e.g. "2026-11-30T10:00:00+05:30")
 * 3. ISO-8601 local date-time (e.g. "2026-11-30T23:59:59")
 * 4. Simple date strings (e.g. "2026-11-30"), defaulting to the end of that day
 */
public class LenientLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.isBlank()) {
            return null;
        }
        text = text.trim();

        // 1. Timestamps ending with Z or timezone offset
        if (text.endsWith("Z") || text.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            try {
                return LocalDateTime.ofInstant(Instant.parse(text), ZoneId.of("UTC"));
            } catch (Exception ignored) {
            }
        }

        // 2. Standard ISO local date-time (contains 'T')
        if (text.contains("T")) {
            try {
                return LocalDateTime.parse(text, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception ignored) {
            }
        }

        // 3. Simple date (e.g. "2026-11-30") -> end of that day
        try {
            return LocalDate.parse(text, DateTimeFormatter.ISO_LOCAL_DATE).atTime(23, 59, 59);
        } catch (Exception e) {
            throw new IOException("Cannot parse deadline date/time: '" + text + "'. Expected format: YYYY-MM-DD or ISO-8601.", e);
        }
    }
}
