package com.nextrole.dto;

import java.time.LocalDateTime;

public record JobSourceDto(
        Long id,
        Long companyId,
        String companyName,
        String sourceType,
        String boardIdentifier,
        boolean enabled,
        LocalDateTime lastAttemptedAt,
        LocalDateTime lastSuccessfulAt,
        String lastError
) {}
