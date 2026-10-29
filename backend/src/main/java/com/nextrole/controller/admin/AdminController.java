package com.nextrole.controller.admin;

import com.nextrole.dto.CompanyDto;
import com.nextrole.dto.JobSourceDto;
import com.nextrole.dto.SyncRunDto;
import com.nextrole.dto.admin.AdminReviewRequest;
import com.nextrole.dto.admin.AdminStatsDto;
import com.nextrole.dto.admin.AdminSubmissionDto;
import com.nextrole.dto.admin.CreateSourceRequest;
import com.nextrole.dto.admin.UpdateSourceRequest;
import com.nextrole.enums.SourceType;
import com.nextrole.enums.SubmissionStatus;
import com.nextrole.service.AdminService;
import com.nextrole.service.CompanyService;
import com.nextrole.service.EmployerJobService;
import com.nextrole.service.SyncService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final CompanyService companyService;
    private final SyncService syncService;
    private final EmployerJobService employerJobService;

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

    // ── Employer Submission Review Endpoints ─────────────────────────

    @GetMapping("/submissions")
    public ResponseEntity<Page<AdminSubmissionDto>> getSubmissions(
            @RequestParam(name = "status", required = false) SubmissionStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        Page<AdminSubmissionDto> result = employerJobService.getAdminSubmissions(status, PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 50)));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/submissions/{id}")
    public ResponseEntity<AdminSubmissionDto> getSubmission(@PathVariable("id") Long id) {
        return ResponseEntity.ok(employerJobService.getAdminSubmission(id));
    }

    @PostMapping("/submissions/{id}/approve")
    public ResponseEntity<AdminSubmissionDto> approveSubmission(
            @PathVariable("id") Long id,
            @RequestBody(required = false) AdminReviewRequest reviewRequest,
            Authentication authentication
    ) {
        String adminUser = authentication != null ? authentication.getName() : "admin";
        String notes = reviewRequest != null ? reviewRequest.getNotes() : "Approved by administrator";
        AdminSubmissionDto approved = employerJobService.approveSubmission(id, adminUser, notes);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/submissions/{id}/reject")
    public ResponseEntity<AdminSubmissionDto> rejectSubmission(
            @PathVariable("id") Long id,
            @RequestBody(required = false) AdminReviewRequest reviewRequest,
            Authentication authentication
    ) {
        String adminUser = authentication != null ? authentication.getName() : "admin";
        String notes = reviewRequest != null ? reviewRequest.getNotes() : "Rejected by administrator";
        AdminSubmissionDto rejected = employerJobService.rejectSubmission(id, adminUser, notes);
        return ResponseEntity.ok(rejected);
    }

    @PostMapping("/submissions/{id}/request-changes")
    public ResponseEntity<AdminSubmissionDto> requestChanges(
            @PathVariable("id") Long id,
            @RequestBody(required = false) AdminReviewRequest reviewRequest,
            Authentication authentication
    ) {
        String adminUser = authentication != null ? authentication.getName() : "admin";
        String notes = reviewRequest != null ? reviewRequest.getNotes() : "Correction required";
        AdminSubmissionDto updated = employerJobService.requestChanges(id, adminUser, notes);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/submissions/{id}/rescan")
    public ResponseEntity<AdminSubmissionDto> rescanSubmission(@PathVariable("id") Long id) {
        return ResponseEntity.ok(employerJobService.rescanSubmission(id));
    }

    public record CsvImportRequest(String csvData) {}

    @PostMapping("/sources/import-csv")
    public ResponseEntity<Map<String, Object>> importSourcesCsv(@RequestBody CsvImportRequest request) {
        if (request.csvData() == null || request.csvData().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "CSV content cannot be empty"));
        }

        String[] lines = request.csvData().split("\\r?\\n");
        int importedCount = 0;
        int skippedCount = 0;
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty() || (i == 0 && (line.toLowerCase().contains("company") || line.toLowerCase().contains("s.no")))) {
                continue;
            }

            // CSV split supporting quotes or commas
            String[] tokens = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
            if (tokens.length >= 2) {
                try {
                    String name = tokens[0].replaceAll("^\"|\"$", "").trim();
                    String careersUrl = tokens[1].replaceAll("^\"|\"$", "").trim();
                    String sourceTypeStr = tokens.length > 2 ? tokens[2].replaceAll("^\"|\"$", "").trim() : "UNSUPPORTED";
                    String boardId = tokens.length > 3 ? tokens[3].replaceAll("^\"|\"$", "").trim() : "";

                    if (name.isBlank() || careersUrl.isBlank()) {
                        skippedCount++;
                        continue;
                    }

                    CompanyDto company = companyService.createCompany(name, null, careersUrl);
                    SourceType st = SourceType.UNSUPPORTED;
                    try {
                        st = SourceType.valueOf(sourceTypeStr.toUpperCase());
                    } catch (Exception ignored) {
                    }

                    CreateSourceRequest req = new CreateSourceRequest();
                    req.setCompanyId(company.id());
                    req.setSourceType(st.name());
                    req.setBoardIdentifier(boardId);
                    adminService.createSource(req);
                    importedCount++;
                } catch (Exception e) {
                    errors.add("Line " + (i + 1) + ": " + e.getMessage());
                    skippedCount++;
                }
            } else {
                skippedCount++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "imported", importedCount,
                "skipped", skippedCount,
                "errors", errors
        ));
    }
}
