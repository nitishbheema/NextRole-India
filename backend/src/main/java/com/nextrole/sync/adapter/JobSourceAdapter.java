package com.nextrole.sync.adapter;

import com.nextrole.entity.JobSource;
import com.nextrole.enums.SourceType;
import com.nextrole.sync.model.NormalizedJob;

import java.util.List;

/**
 * Contract that each ATS adapter must implement.
 */
public interface JobSourceAdapter {

    /**
     * Returns the ATS platform this adapter handles.
     */
    SourceType getSourceType();

    /**
     * Fetches and normalizes all current job postings for the given source.
     * Implementations should apply retry logic internally.
     *
     * @param source the job source configuration
     * @return list of normalized jobs (never null, may be empty)
     * @throws Exception if all retries fail
     */
    List<NormalizedJob> fetchJobs(JobSource source) throws Exception;

    /**
     * Quick health check – returns true when the remote API is reachable.
     */
    boolean isHealthy(JobSource source);
}
