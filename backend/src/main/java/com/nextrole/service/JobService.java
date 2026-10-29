package com.nextrole.service;

import com.nextrole.dto.JobDetailDto;
import com.nextrole.dto.JobDto;
import com.nextrole.dto.JobFilterRequest;
import com.nextrole.dto.PagedResponse;
import com.nextrole.entity.Job;
import com.nextrole.enums.JobStatus;
import com.nextrole.exception.ResourceNotFoundException;
import com.nextrole.repository.JobRepository;
import com.nextrole.repository.JobSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class JobService {

    private final JobRepository jobRepository;

    public PagedResponse<JobDto> getJobs(JobFilterRequest request) {
        int page = request.getValidatedPage();
        int size = request.getValidatedSize();

        Sort sort = Sort.by(Sort.Direction.DESC, "publishedAt")
                .and(Sort.by(Sort.Direction.DESC, "id"));
        if ("lastVerifiedAt".equalsIgnoreCase(request.getSort())) {
            sort = Sort.by(Sort.Direction.DESC, "lastVerifiedAt")
                    .and(Sort.by(Sort.Direction.DESC, "id"));
        } else if ("title".equalsIgnoreCase(request.getSort())) {
            sort = Sort.by(Sort.Direction.ASC, "title");
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Job> spec = JobSpecification.withFilters(request);
        Page<Job> jobPage = jobRepository.findAll(spec, pageable);

        List<JobDto> dtoList = jobPage.getContent().stream()
                .map(this::toJobDto)
                .toList();

        return new PagedResponse<>(
                dtoList,
                jobPage.getNumber(),
                jobPage.getSize(),
                jobPage.getTotalElements(),
                jobPage.getTotalPages(),
                jobPage.hasNext(),
                jobPage.hasPrevious()
        );
    }

    public JobDetailDto getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        // Public detail page must not expose expired jobs
        if (job.getStatus() == JobStatus.EXPIRED) {
            throw new ResourceNotFoundException("Job has expired or is no longer available.");
        }

        return toJobDetailDto(job);
    }

    public List<JobDto> getFreshJobs(int limit) {
        int effectiveLimit = Math.min(Math.max(limit, 1), 50);
        LocalDateTime since = LocalDateTime.now().minusHours(48);
        Pageable pageable = PageRequest.of(0, effectiveLimit);
        return jobRepository.findFreshJobs(since, pageable).stream()
                .map(this::toJobDto)
                .toList();
    }

    public List<JobDto> getFresherJobs(int limit) {
        int effectiveLimit = Math.min(Math.max(limit, 1), 50);
        Pageable pageable = PageRequest.of(0, effectiveLimit);
        return jobRepository.findFresherJobs(pageable).stream()
                .map(this::toJobDto)
                .toList();
    }

    public List<JobDto> getInternshipJobs(int limit) {
        int effectiveLimit = Math.min(Math.max(limit, 1), 50);
        Pageable pageable = PageRequest.of(0, effectiveLimit);
        return jobRepository.findInternshipJobs(pageable).stream()
                .map(this::toJobDto)
                .toList();
    }

    public JobDto toJobDto(Job job) {
        return new JobDto(
                job.getId(),
                job.getTitle(),
                job.getCompany() != null ? job.getCompany().getName() : "Unknown Company",
                job.getCompany() != null ? job.getCompany().getLogoUrl() : null,
                job.getLocation(),
                job.getCountry(),
                job.getJobType() != null ? job.getJobType().name() : null,
                job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null,
                job.getWorkMode() != null ? job.getWorkMode().name() : null,
                job.getApplyUrl(),
                job.getPublishedAt(),
                job.getLastVerifiedAt(),
                job.getFirstSeenAt(),
                job.isEmployerSubmitted()
        );
    }

    public JobDetailDto toJobDetailDto(Job job) {
        String sanitizedDesc = sanitizeDescription(job.getDescription());
        return new JobDetailDto(
                job.getId(),
                job.getTitle(),
                job.getCompany() != null ? job.getCompany().getName() : "Unknown Company",
                job.getCompany() != null ? job.getCompany().getLogoUrl() : null,
                job.getLocation(),
                job.getCountry(),
                job.getJobType() != null ? job.getJobType().name() : null,
                job.getExperienceLevel() != null ? job.getExperienceLevel().name() : null,
                job.getWorkMode() != null ? job.getWorkMode().name() : null,
                job.getApplyUrl(),
                job.getPublishedAt(),
                job.getLastVerifiedAt(),
                job.getFirstSeenAt(),
                sanitizedDesc,
                job.getSourceUrl(),
                job.getSource() != null && job.getSource().getSourceType() != null ?
                        job.getSource().getSourceType().name() : null
        );
    }

    private String sanitizeDescription(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        // Strip HTML tags and normalize entities to prevent frontend script execution
        return input.replaceAll("<[^>]+>", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("&quot;", "\"")
                .replaceAll("&#39;", "'")
                .replaceAll("&nbsp;", " ")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }
}
