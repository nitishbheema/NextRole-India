package com.nextrole.dto;

import java.time.LocalDateTime;

public record SyncRunDto(
        Long id,
        Long sourceId,
        String companyName,
        String sourceType,
        String boardIdentifier,
        LocalDateTime startedAt,
        LocalDateTime completedAt,
        String status,
        int jobsFound,
        int jobsCreated,
        int jobsUpdated,
        int jobsExpired,
        String errorMessage
) {}
