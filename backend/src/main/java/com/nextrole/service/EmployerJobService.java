package com.nextrole.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.dto.admin.AdminSubmissionDto;
import com.nextrole.dto.employer.EmployerJobSubmissionRequest;
import com.nextrole.dto.employer.EmployerJobSubmissionResponse;
import com.nextrole.dto.employer.SubmissionStatusResponse;
import com.nextrole.entity.*;
import com.nextrole.enums.JobStatus;
import com.nextrole.enums.RiskLabel;
import com.nextrole.enums.SourceType;
import com.nextrole.enums.SubmissionStatus;
import com.nextrole.exception.ResourceNotFoundException;
import com.nextrole.repository.*;
import com.nextrole.security.PhishSenseClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployerJobService {

    private static final String REFERENCE_PREFIX = "NR-2026-";
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmployerJobSubmissionRepository submissionRepository;
    private final SubmissionStatusHistoryRepository historyRepository;
    private final CompanyRepository companyRepository;
    private final JobSourceRepository jobSourceRepository;
    private final JobRepository jobRepository;
    private final PhishSenseClient phishSenseClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public EmployerJobSubmissionResponse submitJob(EmployerJobSubmissionRequest request) {
        // Business email / spam checks
        validateBusinessEmail(request.getRecruiterEmail());

        String referenceId = generateUniqueReferenceId();

        // Perform security & link scanning
        PhishSenseClient.PhishSenseScanResult scanResult = phishSenseClient.scanUrl(request.getApplyUrl(), request.getCompanyWebsite());

        SubmissionStatus initialStatus = SubmissionStatus.PENDING_VERIFICATION;
        if (scanResult.riskLabel() == RiskLabel.MALICIOUS || scanResult.threatScore() >= 60) {
            initialStatus = SubmissionStatus.FLAGGED_FOR_SECURITY_REVIEW;
            log.warn("Employer job submission for {} flagged for security review: score={}, flags={}",
                    request.getCompanyName(), scanResult.threatScore(), scanResult.flags());
        }

        String riskDetails = "";
        try {
            riskDetails = objectMapper.writeValueAsString(Map.of(
                    "flags", scanResult.flags(),
                    "source", scanResult.source(),
                    "threatScore", scanResult.threatScore(),
                    "isLiveApi", scanResult.isLiveApiCall()
            ));
        } catch (Exception ignored) {
        }

        EmployerJobSubmission submission = EmployerJobSubmission.builder()
                .referenceId(referenceId)
                .companyName(request.getCompanyName().trim())
                .companyWebsite(request.getCompanyWebsite().trim())
                .recruiterName(request.getRecruiterName().trim())
                .recruiterEmail(request.getRecruiterEmail().trim().toLowerCase())
                .jobTitle(request.getJobTitle().trim())
                .jobDescription(request.getJobDescription().trim())
                .location(request.getLocation() != null ? request.getLocation().trim() : "")
                .country(request.getCountry() != null && !request.getCountry().isBlank() ? request.getCountry().trim() : "India")
                .jobType(request.getJobType())
                .experienceLevel(request.getExperienceLevel())
                .workMode(request.getWorkMode())
                .salaryRange(request.getSalaryRange() != null ? request.getSalaryRange().trim() : null)
                .applyUrl(request.getApplyUrl().trim())
                .officialJobUrl(request.getOfficialJobUrl() != null ? request.getOfficialJobUrl().trim() : null)
                .deadline(request.getDeadline())
                .status(initialStatus)
                .riskLabel(scanResult.riskLabel())
                .threatScore(scanResult.threatScore())
                .riskDetails(riskDetails)
                .build();

        submission = submissionRepository.save(submission);

        // Record initial status history
        SubmissionStatusHistory history = SubmissionStatusHistory.builder()
                .submission(submission)
                .fromStatus(null)
                .toStatus(initialStatus)
                .notes("Submitted by employer (" + request.getRecruiterName() + "). Automated scan: " + scanResult.riskLabel() + " (Score " + scanResult.threatScore() + ")")
                .changedBy("SYSTEM")
                .build();
        historyRepository.save(history);

        log.info("Saved employer submission ref={} for company={} with status={}",
                referenceId, submission.getCompanyName(), initialStatus);

        return new EmployerJobSubmissionResponse(
                referenceId,
                initialStatus,
                "Your job posting has been submitted and is under verification. Our team will review the company details and application link before publishing it. You will be notified when a decision is made.",
                submission.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public SubmissionStatusResponse getSubmissionStatus(String referenceId) {
        EmployerJobSubmission sub = submissionRepository.findByReferenceId(referenceId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found for reference ID: " + referenceId));

        return new SubmissionStatusResponse(
                sub.getReferenceId(),
                sub.getCompanyName(),
                sub.getJobTitle(),
                sub.getStatus(),
                sub.getCreatedAt(),
                sub.getUpdatedAt()
        );
    }

    @Transactional(readOnly = true)
    public Page<AdminSubmissionDto> getAdminSubmissions(SubmissionStatus status, Pageable pageable) {
        Page<EmployerJobSubmission> page = submissionRepository.findAllWithStatusFilter(status, pageable);
        return page.map(this::toAdminDto);
    }

    @Transactional(readOnly = true)
    public AdminSubmissionDto getAdminSubmission(Long id) {
        EmployerJobSubmission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + id));
        return toAdminDto(sub);
    }

    @Transactional
    public AdminSubmissionDto approveSubmission(Long id, String adminUsername, String notes) {
        EmployerJobSubmission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + id));

        if (sub.getStatus() == SubmissionStatus.APPROVED) {
            throw new IllegalStateException("Submission is already approved");
        }

        final String companyName = sub.getCompanyName();
        final String companyWebsite = sub.getCompanyWebsite();

        // Find or create company
        Company company = companyRepository.findByNameIgnoreCase(companyName)
                .orElseGet(() -> {
                    Company newCompany = Company.builder()
                            .name(companyName)
                            .careersUrl(companyWebsite)
                            .build();
                    return companyRepository.save(newCompany);
                });

        final Company targetCompany = company;
        final Long companyId = company.getId();

        // Find or create default direct employer source
        JobSource source = jobSourceRepository.findByCompanyIdAndSourceType(companyId, SourceType.UNSUPPORTED)
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    JobSource newSource = JobSource.builder()
                            .company(targetCompany)
                            .sourceType(SourceType.UNSUPPORTED)
                            .boardIdentifier("employer-direct-" + companyId)
                            .enabled(true)
                            .build();
                    return jobSourceRepository.save(newSource);
                });

        // Create published active Job
        String sourceJobId = "EMP-" + sub.getReferenceId();
        Job job = Job.builder()
                .company(targetCompany)
                .source(source)
                .sourceJobId(sourceJobId)
                .title(sub.getJobTitle())
                .description(sub.getJobDescription())
                .location(sub.getLocation())
                .country(sub.getCountry())
                .jobType(sub.getJobType())
                .experienceLevel(sub.getExperienceLevel())
                .workMode(sub.getWorkMode())
                .applyUrl(sub.getApplyUrl())
                .sourceUrl(sub.getOfficialJobUrl() != null ? sub.getOfficialJobUrl() : sub.getApplyUrl())
                .publishedAt(LocalDateTime.now())
                .firstSeenAt(LocalDateTime.now())
                .lastSeenAt(LocalDateTime.now())
                .lastVerifiedAt(LocalDateTime.now())
                .status(JobStatus.ACTIVE)
                .isEmployerSubmitted(true)
                .build();

        Job savedJob = jobRepository.save(job);

        // Update submission
        SubmissionStatus oldStatus = sub.getStatus();
        sub.setStatus(SubmissionStatus.APPROVED);
        sub.setPublishedJob(savedJob);
        sub.setReviewerUsername(adminUsername);
        sub.setReviewerNotes(notes);
        sub.setReviewedAt(LocalDateTime.now());
        EmployerJobSubmission updatedSub = submissionRepository.save(sub);

        // Add history audit
        SubmissionStatusHistory history = SubmissionStatusHistory.builder()
                .submission(updatedSub)
                .fromStatus(oldStatus)
                .toStatus(SubmissionStatus.APPROVED)
                .notes(notes != null && !notes.isBlank() ? notes : "Approved by administrator")
                .changedBy(adminUsername)
                .build();
        historyRepository.save(history);

        log.info("Admin {} approved submission id={}, ref={}. Published Job id={}",
                adminUsername, id, updatedSub.getReferenceId(), savedJob.getId());

        return toAdminDto(updatedSub);
    }

    @Transactional
    public AdminSubmissionDto rejectSubmission(Long id, String adminUsername, String notes) {
        EmployerJobSubmission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + id));

        SubmissionStatus oldStatus = sub.getStatus();
        sub.setStatus(SubmissionStatus.REJECTED);
        sub.setReviewerUsername(adminUsername);
        sub.setReviewerNotes(notes);
        sub.setReviewedAt(LocalDateTime.now());
        sub = submissionRepository.save(sub);

        SubmissionStatusHistory history = SubmissionStatusHistory.builder()
                .submission(sub)
                .fromStatus(oldStatus)
                .toStatus(SubmissionStatus.REJECTED)
                .notes(notes)
                .changedBy(adminUsername)
                .build();
        historyRepository.save(history);

        return toAdminDto(sub);
    }

    @Transactional
    public AdminSubmissionDto requestChanges(Long id, String adminUsername, String notes) {
        EmployerJobSubmission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + id));

        SubmissionStatus oldStatus = sub.getStatus();
        sub.setStatus(SubmissionStatus.NEEDS_CHANGES);
        sub.setReviewerUsername(adminUsername);
        sub.setReviewerNotes(notes);
        sub.setReviewedAt(LocalDateTime.now());
        sub = submissionRepository.save(sub);

        SubmissionStatusHistory history = SubmissionStatusHistory.builder()
                .submission(sub)
                .fromStatus(oldStatus)
                .toStatus(SubmissionStatus.NEEDS_CHANGES)
                .notes(notes)
                .changedBy(adminUsername)
                .build();
        historyRepository.save(history);

        return toAdminDto(sub);
    }

    @Transactional
    public AdminSubmissionDto rescanSubmission(Long id) {
        EmployerJobSubmission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + id));

        PhishSenseClient.PhishSenseScanResult scan = phishSenseClient.scanUrl(sub.getApplyUrl(), sub.getCompanyWebsite());

        sub.setRiskLabel(scan.riskLabel());
        sub.setThreatScore(scan.threatScore());
        try {
            sub.setRiskDetails(objectMapper.writeValueAsString(Map.of(
                    "flags", scan.flags(),
                    "source", scan.source(),
                    "threatScore", scan.threatScore(),
                    "isLiveApi", scan.isLiveApiCall()
            )));
        } catch (Exception ignored) {
        }

        sub = submissionRepository.save(sub);
        return toAdminDto(sub);
    }

    private void validateBusinessEmail(String email) {
        if (email == null) return;
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase().trim();
        List<String> disposableDomains = List.of(
                "tempmail.com", "throwawaymail.com", "guerrillamail.com", "mailinator.com",
                "10minutemail.com", "trashmail.com", "yopmail.com", "sharklasers.com"
        );
        if (disposableDomains.contains(domain)) {
            throw new IllegalArgumentException("Disposable email addresses are not permitted. Please use your official company recruiter email.");
        }
    }

    private String generateUniqueReferenceId() {
        for (int i = 0; i < 10; i++) {
            StringBuilder sb = new StringBuilder(REFERENCE_PREFIX);
            for (int j = 0; j < 6; j++) {
                sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
            }
            String candidate = sb.toString();
            if (submissionRepository.findByReferenceId(candidate).isEmpty()) {
                return candidate;
            }
        }
        return REFERENCE_PREFIX + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private AdminSubmissionDto toAdminDto(EmployerJobSubmission sub) {
        List<AdminSubmissionDto.StatusHistoryDto> historyList = sub.getStatusHistory().stream()
                .map(h -> new AdminSubmissionDto.StatusHistoryDto(
                        h.getId(),
                        h.getFromStatus(),
                        h.getToStatus(),
                        h.getNotes(),
                        h.getChangedBy(),
                        h.getCreatedAt()
                ))
                .toList();

        return new AdminSubmissionDto(
                sub.getId(),
                sub.getReferenceId(),
                sub.getCompanyName(),
                sub.getCompanyWebsite(),
                sub.getRecruiterName(),
                sub.getRecruiterEmail(),
                sub.getJobTitle(),
                sub.getJobDescription(),
                sub.getLocation(),
                sub.getCountry(),
                sub.getJobType(),
                sub.getExperienceLevel(),
                sub.getWorkMode(),
                sub.getSalaryRange(),
                sub.getApplyUrl(),
                sub.getOfficialJobUrl(),
                sub.getDeadline(),
                sub.getStatus(),
                sub.getRiskLabel(),
                sub.getThreatScore(),
                sub.getRiskDetails(),
                sub.getReviewerNotes(),
                sub.getReviewerUsername(),
                sub.getPublishedJob() != null ? sub.getPublishedJob().getId() : null,
                sub.getCreatedAt(),
                sub.getUpdatedAt(),
                sub.getReviewedAt(),
                historyList
        );
    }
}
