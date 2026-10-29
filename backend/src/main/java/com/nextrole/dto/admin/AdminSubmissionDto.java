package com.nextrole.dto.admin;

import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.RiskLabel;
import com.nextrole.enums.SubmissionStatus;
import com.nextrole.enums.WorkMode;

import java.time.LocalDateTime;
import java.util.List;

public record AdminSubmissionDto(
        Long id,
        String referenceId,
        String companyName,
        String companyWebsite,
        String recruiterName,
        String recruiterEmail,
        String jobTitle,
        String jobDescription,
        String location,
        String country,
        JobType jobType,
        ExperienceLevel experienceLevel,
        WorkMode workMode,
        String salaryRange,
        String applyUrl,
        String officialJobUrl,
        LocalDateTime deadline,
        SubmissionStatus status,
        RiskLabel riskLabel,
        int threatScore,
        String riskDetails,
        String reviewerNotes,
        String reviewerUsername,
        Long publishedJobId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime reviewedAt,
        List<StatusHistoryDto> statusHistory
) {
    public record StatusHistoryDto(
            Long id,
            SubmissionStatus fromStatus,
            SubmissionStatus toStatus,
            String notes,
            String changedBy,
            LocalDateTime createdAt
    ) {}
}
