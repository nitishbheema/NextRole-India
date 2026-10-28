package com.nextrole.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sources/public")
@Slf4j
public class PublicSourceController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<Map<String, Object>> cachedRegistry = Collections.emptyList();

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("company-sources.json");
            try (InputStream is = resource.getInputStream()) {
                cachedRegistry = objectMapper.readValue(is, new TypeReference<>() {});
                log.info("Loaded {} companies from company-sources.json registry", cachedRegistry.size());
            }
        } catch (Exception e) {
            log.warn("Could not load company-sources.json at startup: {}", e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPublicSources() {
        Map<String, Long> statusBreakdown = cachedRegistry.stream()
                .collect(Collectors.groupingBy(
                        item -> String.valueOf(item.getOrDefault("integrationStatus", "NEEDS_VERIFICATION")),
                        Collectors.counting()
                ));

        Map<String, Object> aggregators = Map.of(
                "naukri", Map.of(
                        "name", "Naukri.com",
                        "url", "https://www.naukri.com/",
                        "mode", "LINK_ONLY",
                        "note", "Official external discovery. No public machine-readable API feed without scraping terms."
                ),
                "unstop", Map.of(
                        "name", "Unstop",
                        "url", "https://unstop.com/",
                        "mode", "LINK_ONLY",
                        "note", "Early-career hiring challenges, internships, and hackathons. Link-only redirection."
                )
        );

        return ResponseEntity.ok(Map.of(
                "totalRegisteredCompanies", cachedRegistry.size(),
                "statusBreakdown", statusBreakdown,
                "aggregators", aggregators,
                "companies", cachedRegistry
        ));
    }
}
