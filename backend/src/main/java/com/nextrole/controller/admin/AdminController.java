package com.nextrole.controller.admin;

import com.nextrole.dto.CompanyDto;
import com.nextrole.dto.JobSourceDto;
import com.nextrole.dto.SyncRunDto;
import com.nextrole.dto.admin.AdminStatsDto;
import com.nextrole.dto.admin.CreateSourceRequest;
import com.nextrole.dto.admin.UpdateSourceRequest;
import com.nextrole.service.AdminService;
import com.nextrole.service.CompanyService;
import com.nextrole.service.SyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CompanyService companyService;
    private final SyncService syncService;

    public record CreateCompanyRequest(String name, String logoUrl, String careersUrl) {}

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyDto>> getCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @PostMapping("/companies")
    public ResponseEntity<CompanyDto> createCompany(@RequestBody @Valid CreateCompanyRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Company name cannot be blank");
        }
        if (request.careersUrl() == null || request.careersUrl().isBlank()) {
            throw new IllegalArgumentException("Careers URL cannot be blank");
        }
        CompanyDto created = companyService.createCompany(request.name(), request.logoUrl(), request.careersUrl());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/sources")
    public ResponseEntity<List<JobSourceDto>> getSources() {
        return ResponseEntity.ok(adminService.getAllSources());
    }

    @PostMapping("/sources")
    public ResponseEntity<JobSourceDto> createSource(@RequestBody @Valid CreateSourceRequest request) {
        JobSourceDto created = adminService.createSource(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/sources/{id}")
    public ResponseEntity<JobSourceDto> updateSource(
            @PathVariable("id") Long id,
            @RequestBody UpdateSourceRequest request) {
        return ResponseEntity.ok(adminService.updateSource(id, request));
    }

    @DeleteMapping("/sources/{id}")
    public ResponseEntity<Map<String, String>> disableSource(@PathVariable("id") Long id) {
        adminService.disableSource(id);
        return ResponseEntity.ok(Map.of("message", "Source disabled successfully"));
    }

    @GetMapping("/sync-runs")
    public ResponseEntity<List<SyncRunDto>> getRecentSyncRuns(
            @RequestParam(name = "limit", defaultValue = "50") int limit) {
        return ResponseEntity.ok(adminService.getRecentSyncRuns(limit));
    }

    @PostMapping("/sync/trigger")
    public ResponseEntity<Map<String, Object>> triggerSync() {
        boolean started = syncService.triggerSyncAsync();
        if (started) {
            return ResponseEntity.ok(Map.of(
                    "status", "STARTED",
                    "message", "Job synchronization triggered successfully in the background."
            ));
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "status", "ALREADY_RUNNING",
                    "message", "A synchronization run is already in progress."
            ));
        }
    }
}
