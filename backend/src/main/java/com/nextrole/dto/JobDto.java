package com.nextrole.dto;

import java.time.LocalDateTime;

public record JobDto(
        Long id,
        String title,
        String companyName,
        String companyLogoUrl,
        String location,
        String country,
        String jobType,
        String experienceLevel,
        String workMode,
        String applyUrl,
        LocalDateTime publishedAt,
        LocalDateTime lastVerifiedAt,
        LocalDateTime firstSeenAt
) {}
