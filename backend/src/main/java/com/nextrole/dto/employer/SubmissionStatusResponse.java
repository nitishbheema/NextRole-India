package com.nextrole.dto.employer;

import com.nextrole.enums.SubmissionStatus;

import java.time.LocalDateTime;

public record SubmissionStatusResponse(
        String referenceId,
        String companyName,
        String jobTitle,
        SubmissionStatus status,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt
) {}
