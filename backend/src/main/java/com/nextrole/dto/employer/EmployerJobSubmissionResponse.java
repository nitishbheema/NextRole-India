package com.nextrole.dto.employer;

import com.nextrole.enums.SubmissionStatus;

import java.time.LocalDateTime;

public record EmployerJobSubmissionResponse(
        String referenceId,
        SubmissionStatus status,
        String message,
        LocalDateTime submittedAt
) {}
