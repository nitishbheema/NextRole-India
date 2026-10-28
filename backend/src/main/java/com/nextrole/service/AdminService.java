package com.nextrole.service;

import com.nextrole.dto.JobSourceDto;
import com.nextrole.dto.SyncRunDto;
import com.nextrole.dto.admin.AdminStatsDto;
import com.nextrole.dto.admin.CreateSourceRequest;
import com.nextrole.dto.admin.UpdateSourceRequest;
import com.nextrole.entity.Company;
import com.nextrole.entity.JobSource;
import com.nextrole.entity.SyncRun;
import com.nextrole.enums.JobStatus;
import com.nextrole.enums.SourceType;
import com.nextrole.exception.ResourceNotFoundException;
import com.nextrole.repository.CompanyRepository;
import com.nextrole.repository.JobRepository;
import com.nextrole.repository.JobSourceRepository;
import com.nextrole.repository.SyncRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final JobSourceRepository sourceRepository;
    private final SyncRunRepository syncRunRepository;

    public AdminStatsDto getStats() {
        long totalJobs = jobRepository.count();
        long activeJobs = jobRepository.countByStatus(JobStatus.ACTIVE);
        long expiredJobs = jobRepository.countByStatus(JobStatus.EXPIRED);
        long totalCompanies = companyRepository.count();
        long totalSources = sourceRepository.count();
        long enabledSources = sourceRepository.findByEnabledTrue().size();

        List<SyncRun> recentRuns = syncRunRepository.findRecentRuns(PageRequest.of(0, 50));
        long successfulRuns = recentRuns.stream()
                .filter(r -> "SUCCESS".equalsIgnoreCase(r.getStatus()))
                .count();

        return new AdminStatsDto(
                totalJobs,
                activeJobs,
                expiredJobs,
                totalCompanies,
                totalSources,
                enabledSources,
                recentRuns.size(),
                successfulRuns
        );
    }

    public List<JobSourceDto> getAllSources() {
        return sourceRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(this::toJobSourceDto)
                .toList();
    }

    @Transactional
    public JobSourceDto createSource(CreateSourceRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + request.getCompanyId()));

        SourceType sourceType;
        try {
            sourceType = SourceType.valueOf(request.getSourceType().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported source type: " + request.getSourceType());
        }

        if (sourceRepository.existsByCompanyIdAndSourceTypeAndBoardIdentifier(
                company.getId(), sourceType, request.getBoardIdentifier().trim())) {
            throw new IllegalArgumentException("This board identifier is already configured for this company and source type.");
        }

        JobSource source = JobSource.builder()
                .company(company)
                .sourceType(sourceType)
                .boardIdentifier(request.getBoardIdentifier().trim())
                .enabled(request.isEnabled())
                .build();

        JobSource saved = sourceRepository.save(source);
        return toJobSourceDto(saved);
    }

    @Transactional
    public JobSourceDto updateSource(Long id, UpdateSourceRequest request) {
        JobSource source = sourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobSource not found with id: " + id));

        if (request.getBoardIdentifier() != null && !request.getBoardIdentifier().isBlank()) {
            source.setBoardIdentifier(request.getBoardIdentifier().trim());
        }
        if (request.getEnabled() != null) {
            source.setEnabled(request.getEnabled());
        }

        JobSource saved = sourceRepository.save(source);
        return toJobSourceDto(saved);
    }

    @Transactional
    public void disableSource(Long id) {
        JobSource source = sourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("JobSource not found with id: " + id));
        source.setEnabled(false);
        sourceRepository.save(source);
    }

    public List<SyncRunDto> getRecentSyncRuns(int limit) {
        int effectiveLimit = Math.min(Math.max(limit, 1), 100);
        return syncRunRepository.findRecentRuns(PageRequest.of(0, effectiveLimit)).stream()
                .map(this::toSyncRunDto)
                .toList();
    }

    private JobSourceDto toJobSourceDto(JobSource source) {
        return new JobSourceDto(
                source.getId(),
                source.getCompany() != null ? source.getCompany().getId() : null,
                source.getCompany() != null ? source.getCompany().getName() : "Unknown Company",
                source.getSourceType() != null ? source.getSourceType().name() : null,
                source.getBoardIdentifier(),
                source.isEnabled(),
                source.getLastAttemptedAt(),
                source.getLastSuccessfulAt(),
                source.getLastError()
        );
    }

    private SyncRunDto toSyncRunDto(SyncRun run) {
        JobSource source = run.getSource();
        Company company = source != null ? source.getCompany() : null;

        return new SyncRunDto(
                run.getId(),
                source != null ? source.getId() : null,
                company != null ? company.getName() : "Unknown Company",
                source != null && source.getSourceType() != null ? source.getSourceType().name() : null,
                source != null ? source.getBoardIdentifier() : null,
                run.getStartedAt(),
                run.getCompletedAt(),
                run.getStatus(),
                run.getJobsFound(),
                run.getJobsCreated(),
                run.getJobsUpdated(),
                run.getJobsExpired(),
                run.getErrorMessage()
        );
    }
}
