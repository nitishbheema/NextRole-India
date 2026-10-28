package com.nextrole.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.entity.Company;
import com.nextrole.repository.CompanyRepository;
import com.nextrole.repository.JobRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sources/public")
@RequiredArgsConstructor
@Slf4j
public class PublicSourceController {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
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
        // Build map of DB company counts if available
        Map<String, Long> activeJobCountsByCompanyName = new HashMap<>();
        Map<String, Long> dbCompanyIdsByName = new HashMap<>();
        Map<String, String> dbLogoUrlsByName = new HashMap<>();

        try {
            List<Company> dbCompanies = companyRepository.findAll();
            Map<Long, Long> countsByCompanyId = new HashMap<>();
            List<Object[]> rawCounts = jobRepository.countActiveGroupedByCompanyId();
            for (Object[] row : rawCounts) {
                if (row[0] != null && row[1] != null) {
                    countsByCompanyId.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
                }
            }

            for (Company c : dbCompanies) {
                String normalizedName = c.getName().trim().toLowerCase();
                dbCompanyIdsByName.put(normalizedName, c.getId());
                long activeCount = countsByCompanyId.getOrDefault(c.getId(), 0L);
                activeJobCountsByCompanyName.put(normalizedName, activeCount);
                if (c.getLogoUrl() != null && !c.getLogoUrl().isBlank()) {
                    dbLogoUrlsByName.put(normalizedName, c.getLogoUrl());
                }
            }
        } catch (Exception e) {
            log.warn("Could not query DB for active company job counts: {}", e.getMessage());
        }

        // Enrich registry companies with real database state without modifying original registry
        List<Map<String, Object>> enrichedCompanies = cachedRegistry.stream().map(c -> {
            Map<String, Object> copy = new LinkedHashMap<>(c);
            String name = String.valueOf(c.getOrDefault("name", "")).trim().toLowerCase();

            Long dbCompanyId = dbCompanyIdsByName.get(name);
            Long activeJobCount = activeJobCountsByCompanyName.get(name);
            String dbLogo = dbLogoUrlsByName.get(name);

            copy.put("dbCompanyId", dbCompanyId);
            // Only attach an activeJobCount if the company is actually tracked in DB with jobs
            copy.put("activeJobCount", activeJobCount != null && activeJobCount > 0 ? activeJobCount : null);
            if (dbLogo != null && !dbLogo.isBlank()) {
                copy.put("logoUrl", dbLogo);
            }
            return copy;
        }).collect(Collectors.toList());

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
                "totalRegisteredCompanies", enrichedCompanies.size(),
                "statusBreakdown", statusBreakdown,
                "aggregators", aggregators,
                "companies", enrichedCompanies
        ));
    }
}
