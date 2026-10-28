package com.nextrole.dto.admin;

public record AdminStatsDto(
        long totalJobs,
        long activeJobs,
        long expiredJobs,
        long totalCompanies,
        long totalSources,
        long enabledSources,
        long syncRunsLast24h,
        long successfulSyncRunsLast24h
) {}
