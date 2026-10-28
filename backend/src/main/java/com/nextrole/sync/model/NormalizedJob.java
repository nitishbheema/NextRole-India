package com.nextrole.sync.model;

import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.WorkMode;

import java.time.LocalDateTime;

/**
 * Provider-agnostic normalized job model.
 * All ATS adapters must convert their raw responses to this record.
 */
public record NormalizedJob(
        String sourceJobId,
        String title,
        String description,
        String location,
        String country,
        JobType jobType,
        ExperienceLevel experienceLevel,
        WorkMode workMode,
        String applyUrl,
        String sourceUrl,
        LocalDateTime publishedAt,
        boolean closed
) {
    public NormalizedJob {
        if (sourceJobId == null || sourceJobId.isBlank()) {
            throw new IllegalArgumentException("sourceJobId must not be blank");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("title must not be blank");
        }
        if (applyUrl == null || applyUrl.isBlank()) {
            throw new IllegalArgumentException("applyUrl must not be blank");
        }
    }
}
