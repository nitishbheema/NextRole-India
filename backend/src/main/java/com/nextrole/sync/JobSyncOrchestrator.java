package com.nextrole.sync;

import com.nextrole.entity.Job;
import com.nextrole.entity.JobSource;
import com.nextrole.entity.SyncRun;
import com.nextrole.enums.JobStatus;
import com.nextrole.repository.JobRepository;
import com.nextrole.repository.JobSourceRepository;
import com.nextrole.repository.SyncRunRepository;
import com.nextrole.sync.adapter.JobSourceAdapter;
import com.nextrole.sync.model.NormalizedJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Orchestrates the full sync lifecycle for all enabled job sources.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JobSyncOrchestrator {

    private static final int MISSING_COUNT_THRESHOLD = 2;
    private static final String MISSING_EXPIRE_REASON = "Missing from source after 2 complete syncs";

    private final JobSourceRepository jobSourceRepository;
    private final JobRepository jobRepository;
    private final SyncRunRepository syncRunRepository;
    private final List<JobSourceAdapter> adapters;

    /**
     * Runs sync for all enabled sources sequentially.
     */
    public List<SyncRun> syncAll() {
        List<JobSource> enabledSources = jobSourceRepository.findAllEnabledWithCompany();
        log.info("Starting sync for {} enabled source(s)", enabledSources.size());

        List<SyncRun> results = new ArrayList<>();
        for (JobSource source : enabledSources) {
            try {
                SyncRun run = syncSource(source);
                results.add(run);
            } catch (Exception e) {
                log.error("Unexpected error syncing source id={}: {}", source.getId(), e.getMessage(), e);
            }
        }

        log.info("Sync complete. Processed {} source(s).", results.size());
        return results;
    }

    /**
     * Syncs a single source. Each source runs in its own transaction to isolate failures.
     */
    @Transactional
    public SyncRun syncSource(JobSource source) {
        log.info("Syncing source: [{}] {} ({})", source.getSourceType(), source.getCompany().getName(), source.getBoardIdentifier());

        SyncRun syncRun = SyncRun.builder()
                .source(source)
                .startedAt(LocalDateTime.now())
                .status("RUNNING")
                .build();
        syncRun = syncRunRepository.save(syncRun);

        source.setLastAttemptedAt(LocalDateTime.now());
        jobSourceRepository.save(source);

        JobSourceAdapter adapter = findAdapter(source);
        if (adapter == null) {
            String error = "No adapter found for source type: " + source.getSourceType();
            log.error(error);
            return failSyncRun(syncRun, source, error);
        }

        List<NormalizedJob> fetchedJobs;
        try {
            fetchedJobs = adapter.fetchJobs(source);
        } catch (Exception e) {
            log.error("Fetch failed for source id={} ({}): {}", source.getId(), source.getBoardIdentifier(), e.getMessage());
            source.setLastError(e.getMessage());
            jobSourceRepository.save(source);
            // DO NOT expire existing jobs on fetch failure
            return failSyncRun(syncRun, source, e.getMessage());
        }

        // Fetch succeeded
        source.setLastSuccessfulAt(LocalDateTime.now());
        source.setLastError(null);
        jobSourceRepository.save(source);

        Map<String, NormalizedJob> fetchedMap = fetchedJobs.stream()
                .collect(Collectors.toMap(NormalizedJob::sourceJobId, Function.identity(), (a, b) -> a));

        Set<String> fetchedIds = fetchedMap.keySet();

        int created = 0;
        int updated = 0;
        int expiredCount = 0;

        LocalDateTime now = LocalDateTime.now();

        for (NormalizedJob normalized : fetchedJobs) {
            try {
                Optional<Job> existingOpt = jobRepository.findBySourceIdAndSourceJobId(
                        source.getId(), normalized.sourceJobId());

                if (normalized.closed()) {
                    if (existingOpt.isPresent()) {
                        Job existing = existingOpt.get();
                        if (existing.getStatus() != JobStatus.EXPIRED) {
                            existing.setStatus(JobStatus.EXPIRED);
                            existing.setExpiredAt(now);
                            existing.setExpiredReason("Job closed by source");
                            existing.setLastSeenAt(now);
                            existing.setLastVerifiedAt(now);
                            jobRepository.save(existing);
                            expiredCount++;
                        }
                    }
                    continue;
                }

                if (existingOpt.isEmpty()) {
                    Job newJob = Job.builder()
                            .company(source.getCompany())
                            .source(source)
                            .sourceJobId(normalized.sourceJobId())
                            .title(normalized.title())
                            .description(normalized.description())
                            .location(normalized.location())
                            .country(normalized.country() != null ? normalized.country() : "India")
                            .jobType(normalized.jobType())
                            .experienceLevel(normalized.experienceLevel())
                            .workMode(normalized.workMode())
                            .applyUrl(normalized.applyUrl())
                            .sourceUrl(normalized.sourceUrl())
                            .publishedAt(normalized.publishedAt())
                            .status(JobStatus.ACTIVE)
                            .firstSeenAt(now)
                            .lastSeenAt(now)
                            .lastVerifiedAt(now)
                            .missingFromSourceCount(0)
                            .build();
                    jobRepository.save(newJob);
                    created++;
                } else {
                    Job existing = existingOpt.get();
                    existing.setTitle(normalized.title());
                    if (normalized.description() != null && !normalized.description().isBlank()) {
                        existing.setDescription(normalized.description());
                    }
                    existing.setLocation(normalized.location());
                    if (normalized.country() != null) existing.setCountry(normalized.country());
                    existing.setJobType(normalized.jobType());
                    existing.setExperienceLevel(normalized.experienceLevel());
                    existing.setWorkMode(normalized.workMode());
                    existing.setApplyUrl(normalized.applyUrl());
                    existing.setSourceUrl(normalized.sourceUrl());
                    if (normalized.publishedAt() != null) existing.setPublishedAt(normalized.publishedAt());
                    existing.setMissingFromSourceCount(0);
                    existing.setLastSeenAt(now);
                    existing.setLastVerifiedAt(now);
                    if (existing.getStatus() == JobStatus.NEEDS_RECHECK) {
                        existing.setStatus(JobStatus.ACTIVE);
                    }
                    jobRepository.save(existing);
                    updated++;
                }
            } catch (Exception e) {
                log.warn("Error processing job sourceJobId={}: {}", normalized.sourceJobId(), e.getMessage());
            }
        }

        // Handle jobs not in fetched set
        List<Job> missingJobs = fetchedIds.isEmpty()
                ? new ArrayList<>()
                : jobRepository.findActiveJobsNotInFetchedSet(source.getId(), new ArrayList<>(fetchedIds));

        List<Long> toExpireIds = new ArrayList<>();
        List<Long> toIncrementIds = new ArrayList<>();

        for (Job missingJob : missingJobs) {
            int newCount = missingJob.getMissingFromSourceCount() + 1;
            if (newCount >= MISSING_COUNT_THRESHOLD) {
                toExpireIds.add(missingJob.getId());
            } else {
                toIncrementIds.add(missingJob.getId());
            }
        }

        if (!toIncrementIds.isEmpty()) {
            jobRepository.incrementMissingCountAndSetNeedsRecheck(toIncrementIds);
        }
        if (!toExpireIds.isEmpty()) {
            jobRepository.expireJobs(toExpireIds, now, MISSING_EXPIRE_REASON);
            expiredCount += toExpireIds.size();
        }

        syncRun.setCompletedAt(LocalDateTime.now());
        syncRun.setStatus("SUCCESS");
        syncRun.setJobsFound(fetchedJobs.size());
        syncRun.setJobsCreated(created);
        syncRun.setJobsUpdated(updated);
        syncRun.setJobsExpired(expiredCount);
        syncRun = syncRunRepository.save(syncRun);

        log.info("Source {} sync complete: found={}, created={}, updated={}, expired={}",
                source.getBoardIdentifier(), fetchedJobs.size(), created, updated, expiredCount);
        return syncRun;
    }

    private SyncRun failSyncRun(SyncRun syncRun, JobSource source, String errorMessage) {
        syncRun.setCompletedAt(LocalDateTime.now());
        syncRun.setStatus("FAILED");
        syncRun.setErrorMessage(errorMessage);
        return syncRunRepository.save(syncRun);
    }

    private JobSourceAdapter findAdapter(JobSource source) {
        return adapters.stream()
                .filter(a -> a.getSourceType() == source.getSourceType())
                .findFirst()
                .orElse(null);
    }
}
