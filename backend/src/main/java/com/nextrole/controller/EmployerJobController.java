package com.nextrole.controller;

import com.nextrole.dto.employer.EmployerJobSubmissionRequest;
import com.nextrole.dto.employer.EmployerJobSubmissionResponse;
import com.nextrole.dto.employer.SubmissionStatusResponse;
import com.nextrole.service.EmployerJobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employer/jobs")
@RequiredArgsConstructor
@Slf4j
public class EmployerJobController {

    private final EmployerJobService employerJobService;

    @PostMapping
    public ResponseEntity<EmployerJobSubmissionResponse> submitJob(@Valid @RequestBody EmployerJobSubmissionRequest request) {
        log.info("Received employer job submission for company: {}, title: {}", request.getCompanyName(), request.getJobTitle());
        EmployerJobSubmissionResponse response = employerJobService.submitJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/status/{referenceId}")
    public ResponseEntity<SubmissionStatusResponse> getStatus(@PathVariable String referenceId) {
        SubmissionStatusResponse response = employerJobService.getSubmissionStatus(referenceId);
        return ResponseEntity.ok(response);
    }
}
