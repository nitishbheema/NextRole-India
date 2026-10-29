package com.nextrole.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.dto.employer.EmployerJobSubmissionRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class LenientLocalDateTimeDeserializerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Deserializes ISO-8601 UTC timestamp with Z into LocalDateTime")
    void testDeserializeIsoWithZ() throws Exception {
        String json = "{\"deadline\":\"2026-11-30T14:30:00.000Z\"}";
        EmployerJobSubmissionRequest req = objectMapper.readValue(json, EmployerJobSubmissionRequest.class);
        assertNotNull(req.getDeadline());
        assertEquals(2026, req.getDeadline().getYear());
        assertEquals(11, req.getDeadline().getMonthValue());
        assertEquals(30, req.getDeadline().getDayOfMonth());
        assertEquals(14, req.getDeadline().getHour());
        assertEquals(30, req.getDeadline().getMinute());
    }

    @Test
    @DisplayName("Deserializes standard ISO local date-time into LocalDateTime")
    void testDeserializeStandardIso() throws Exception {
        String json = "{\"deadline\":\"2026-12-15T23:59:59\"}";
        EmployerJobSubmissionRequest req = objectMapper.readValue(json, EmployerJobSubmissionRequest.class);
        assertNotNull(req.getDeadline());
        assertEquals(2026, req.getDeadline().getYear());
        assertEquals(12, req.getDeadline().getMonthValue());
        assertEquals(15, req.getDeadline().getDayOfMonth());
        assertEquals(23, req.getDeadline().getHour());
        assertEquals(59, req.getDeadline().getMinute());
        assertEquals(59, req.getDeadline().getSecond());
    }

    @Test
    @DisplayName("Deserializes simple YYYY-MM-DD date into LocalDateTime at end of day")
    void testDeserializeSimpleDate() throws Exception {
        String json = "{\"deadline\":\"2026-10-29\"}";
        EmployerJobSubmissionRequest req = objectMapper.readValue(json, EmployerJobSubmissionRequest.class);
        assertNotNull(req.getDeadline());
        assertEquals(2026, req.getDeadline().getYear());
        assertEquals(10, req.getDeadline().getMonthValue());
        assertEquals(29, req.getDeadline().getDayOfMonth());
        assertEquals(23, req.getDeadline().getHour());
        assertEquals(59, req.getDeadline().getMinute());
        assertEquals(59, req.getDeadline().getSecond());
    }

    @Test
    @DisplayName("Handles null or blank deadline string gracefully")
    void testDeserializeNullOrBlank() throws Exception {
        String jsonNull = "{\"deadline\":null}";
        EmployerJobSubmissionRequest req1 = objectMapper.readValue(jsonNull, EmployerJobSubmissionRequest.class);
        assertNull(req1.getDeadline());

        String jsonEmpty = "{\"deadline\":\"\"}";
        EmployerJobSubmissionRequest req2 = objectMapper.readValue(jsonEmpty, EmployerJobSubmissionRequest.class);
        assertNull(req2.getDeadline());
    }
}
