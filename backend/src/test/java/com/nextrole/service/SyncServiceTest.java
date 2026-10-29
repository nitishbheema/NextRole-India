package com.nextrole.service;

import com.nextrole.entity.Company;
import com.nextrole.entity.Job;
import com.nextrole.entity.JobSource;
import com.nextrole.entity.SyncRun;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobStatus;
import com.nextrole.enums.JobType;
import com.nextrole.enums.SourceType;
import com.nextrole.enums.WorkMode;
import com.nextrole.repository.CompanyRepository;
import com.nextrole.repository.JobRepository;
import com.nextrole.repository.JobSourceRepository;
import com.nextrole.repository.SyncRunRepository;
import com.nextrole.sync.JobSyncOrchestrator;
import com.nextrole.sync.adapter.JobSourceAdapter;
import com.nextrole.sync.model.NormalizedJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SyncServiceTest {

    @Mock
    private JobSourceRepository sourceRepository;
    @Mock
    private JobRepository jobRepository;
    @Mock
    private SyncRunRepository syncRunRepository;
    @Mock
    private JobSourceAdapter mockAdapter;

    private JobSyncOrchestrator orchestrator;

    private Company testCompany;
    private JobSource testSource;

    @BeforeEach
    void setUp() {
        when(mockAdapter.getSourceType()).thenReturn(SourceType.GREENHOUSE);
        orchestrator = new JobSyncOrchestrator(
                sourceRepository,
                jobRepository,
                syncRunRepository,
                List.of(mockAdapter)
        );

        testCompany = Company.builder()
                .id(1L)
                .name("Tech Corp India")
                .careersUrl("https://techcorp.in/careers")
                .build();

        testSource = JobSource.builder()
                .id(10L)
                .company(testCompany)
                .sourceType(SourceType.GREENHOUSE)
                .boardIdentifier("techcorp")
                .enabled(true)
                .build();

        when(syncRunRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(sourceRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("Rule 1: New job discovered in successful source fetch is inserted as ACTIVE")
    void testNewJobInsertedAsActive() throws Exception {
        NormalizedJob newJob = new NormalizedJob(
                "job-1",
                "Backend Engineer",
                "Description",
                "Bengaluru",
                "India",
                JobType.FULL_TIME,
                ExperienceLevel.MID,
                WorkMode.HYBRID,
                "https://apply.url/1",
                "https://source.url/1",
                LocalDateTime.now(),
                false
        );

        when(mockAdapter.fetchJobs(testSource)).thenReturn(List.of(newJob));
        when(jobRepository.findBySourceId(testSource.getId())).thenReturn(List.of());

        SyncRun result = orchestrator.syncSource(testSource);

        assertThat(result.getJobsCreated()).isEqualTo(1);
        assertThat(result.getJobsUpdated()).isEqualTo(0);
        assertThat(result.getJobsExpired()).isEqualTo(0);
        verify(jobRepository, times(1)).save(argThat(j ->
                j.getSourceJobId().equals("job-1") &&
                j.getStatus() == JobStatus.ACTIVE &&
                j.getMissingFromSourceCount() == 0
        ));
    }

    @Test
    @DisplayName("Rule 2: Existing job seen again updates details, resets missing count, and refreshes verification time")
    void testExistingJobUpdated() throws Exception {
        Job existingJob = Job.builder()
                .id(101L)
                .company(testCompany)
                .source(testSource)
                .sourceJobId("job-1")
                .title("Old Title")
                .status(JobStatus.NEEDS_RECHECK)
                .missingFromSourceCount(1)
                .applyUrl("https://old.url")
                .firstSeenAt(LocalDateTime.now().minusDays(5))
                .lastSeenAt(LocalDateTime.now().minusDays(1))
                .lastVerifiedAt(LocalDateTime.now().minusDays(1))
                .build();

        NormalizedJob updatedJob = new NormalizedJob(
                "job-1",
                "Updated Senior Title",
                "New Description",
                "Bengaluru",
                "India",
                JobType.FULL_TIME,
                ExperienceLevel.SENIOR,
                WorkMode.REMOTE,
                "https://apply.url/new",
                "https://source.url/1",
                LocalDateTime.now(),
                false
        );

        when(mockAdapter.fetchJobs(testSource)).thenReturn(List.of(updatedJob));
        when(jobRepository.findBySourceIdAndSourceJobId(testSource.getId(), "job-1")).thenReturn(Optional.of(existingJob));
        when(jobRepository.findBySourceId(testSource.getId())).thenReturn(List.of(existingJob));

        SyncRun result = orchestrator.syncSource(testSource);

        assertThat(result.getJobsUpdated()).isEqualTo(1);
        assertThat(existingJob.getTitle()).isEqualTo("Updated Senior Title");
        assertThat(existingJob.getStatus()).isEqualTo(JobStatus.ACTIVE); // restored from NEEDS_RECHECK
        assertThat(existingJob.getMissingFromSourceCount()).isEqualTo(0); // reset
        verify(jobRepository, times(1)).save(existingJob);
    }

    @Test
    @DisplayName("Rule 3: Explicit closure from source expires job immediately")
    void testAuthoritativeClosure() throws Exception {
        Job existingJob = Job.builder()
                .id(102L)
                .company(testCompany)
                .source(testSource)
                .sourceJobId("job-closed")
                .title("Closed Title")
                .status(JobStatus.ACTIVE)
                .missingFromSourceCount(0)
                .build();

        NormalizedJob closedJob = new NormalizedJob(
                "job-closed",
                "Closed Title",
                "Description",
                "Delhi",
                "India",
                JobType.FULL_TIME,
                ExperienceLevel.MID,
                WorkMode.ONSITE,
                "https://apply.url/closed",
                "https://source.url/closed",
                LocalDateTime.now(),
                true // Source marks explicitly closed
        );

        when(mockAdapter.fetchJobs(testSource)).thenReturn(List.of(closedJob));
        when(jobRepository.findBySourceIdAndSourceJobId(testSource.getId(), "job-closed")).thenReturn(Optional.of(existingJob));
        when(jobRepository.findBySourceId(testSource.getId())).thenReturn(List.of(existingJob));

        SyncRun result = orchestrator.syncSource(testSource);

        assertThat(result.getJobsExpired()).isEqualTo(1);
        assertThat(existingJob.getStatus()).isEqualTo(JobStatus.EXPIRED);
        assertThat(existingJob.getExpiredReason()).contains("closed by source");
        assertThat(existingJob.getExpiredAt()).isNotNull();
    }

    @Test
    @DisplayName("Rule 4 & 5: First missing run marks NEEDS_RECHECK; second missing run EXPIRES job")
    void testLifecycleMissingProgression() throws Exception {
        Job jobToMiss = Job.builder()
                .id(103L)
                .company(testCompany)
                .source(testSource)
                .sourceJobId("job-disappearing")
                .title("Disappearing Job")
                .status(JobStatus.ACTIVE)
                .missingFromSourceCount(0)
                .build();

        // Run 1: Source returns empty list (complete successful fetch with 0 active jobs)
        when(mockAdapter.fetchJobs(testSource)).thenReturn(List.of());
        when(jobRepository.findBySourceId(testSource.getId())).thenReturn(List.of(jobToMiss));

        orchestrator.syncSource(testSource);

        // After 1st missing run: incrementMissingCountAndSetNeedsRecheck was called with jobToMiss id
        verify(jobRepository, times(1)).incrementMissingCountAndSetNeedsRecheck(List.of(jobToMiss.getId()));

        // Run 2: Missing again from complete fetch (simulate count now 1)
        jobToMiss.setMissingFromSourceCount(1);
        orchestrator.syncSource(testSource);

        // After 2nd missing run: expireJobs was called
        verify(jobRepository, times(1)).expireJobs(eq(List.of(jobToMiss.getId())), any(), any());
    }

    @Test
    @DisplayName("Rule 6: Failed or timed out fetch DOES NOT cause any job to expire")
    void testFailedFetchDoesNotExpireJobs() throws Exception {
        Job activeJob = Job.builder()
                .id(104L)
                .company(testCompany)
                .source(testSource)
                .sourceJobId("job-safe")
                .title("Safe Job")
                .status(JobStatus.ACTIVE)
                .missingFromSourceCount(0)
                .build();

        // Adapter throws network/timeout exception
        when(mockAdapter.fetchJobs(testSource)).thenThrow(new RuntimeException("Connection timed out"));

        SyncRun result = orchestrator.syncSource(testSource);

        // Should report 0 expired
        assertThat(result.getJobsExpired()).isEqualTo(0);
        // Active job must remain untouched (still ACTIVE, count still 0)
        assertThat(activeJob.getStatus()).isEqualTo(JobStatus.ACTIVE);
        assertThat(activeJob.getMissingFromSourceCount()).isEqualTo(0);
        // No save should have occurred on the job
        verify(jobRepository, never()).save(activeJob);
        // Source should record last error
        assertThat(testSource.getLastError()).contains("Connection timed out");
    }
}
