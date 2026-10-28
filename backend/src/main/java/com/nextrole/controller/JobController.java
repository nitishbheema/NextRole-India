package com.nextrole.controller;

import com.nextrole.dto.JobDetailDto;
import com.nextrole.dto.JobDto;
import com.nextrole.dto.JobFilterRequest;
import com.nextrole.dto.PagedResponse;
import com.nextrole.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<PagedResponse<JobDto>> getJobs(
            @ModelAttribute JobFilterRequest filterRequest) {
        return ResponseEntity.ok(jobService.getJobs(filterRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDetailDto> getJobById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/fresh")
    public ResponseEntity<List<JobDto>> getFreshJobs(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(jobService.getFreshJobs(limit));
    }

    @GetMapping("/fresher")
    public ResponseEntity<List<JobDto>> getFresherJobs(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(jobService.getFresherJobs(limit));
    }

    @GetMapping("/internships")
    public ResponseEntity<List<JobDto>> getInternships(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return ResponseEntity.ok(jobService.getInternshipJobs(limit));
    }
}
