package com.nextrole.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.dto.employer.EmployerJobSubmissionRequest;
import com.nextrole.dto.employer.EmployerJobSubmissionResponse;
import com.nextrole.entity.EmployerJobSubmission;
import com.nextrole.entity.SubmissionStatusHistory;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.RiskLabel;
import com.nextrole.enums.SubmissionStatus;
import com.nextrole.enums.WorkMode;
import com.nextrole.repository.*;
import com.nextrole.security.PhishSenseClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployerJobServiceTest {

    @Mock
    private EmployerJobSubmissionRepository submissionRepository;

    @Mock
    private SubmissionStatusHistoryRepository historyRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private JobSourceRepository jobSourceRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private PhishSenseClient phishSenseClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private EmployerJobService service;

    @BeforeEach
    void setUp() {
        service = new EmployerJobService(
                submissionRepository,
                historyRepository,
                companyRepository,
                jobSourceRepository,
                jobRepository,
                phishSenseClient,
                objectMapper
        );
    }

    private EmployerJobSubmissionRequest createValidRequest() {
        EmployerJobSubmissionRequest req = new EmployerJobSubmissionRequest();
        req.setCompanyName("Swiggy");
        req.setCompanyWebsite("https://swiggy.com");
        req.setRecruiterName("Rahul Sen");
        req.setRecruiterEmail("rahul@swiggy.com");
        req.setJobTitle("Software Engineer - Core");
        req.setJobDescription("Develop high-throughput ordering APIs in Java & Spring Boot");
        req.setLocation("Bengaluru, India");
        req.setJobType(JobType.FULL_TIME);
        req.setExperienceLevel(ExperienceLevel.JUNIOR);
        req.setWorkMode(WorkMode.HYBRID);
        req.setApplyUrl("https://swiggy.com/careers/job-101");
        req.setAuthorizedConsent(true);
        req.setDeadline(LocalDateTime.of(2026, 11, 30, 23, 59, 59));
        return req;
    }

    @Test
    @DisplayName("submitJob succeeds with corporate email, saves submission and initial audit history")
    void testSubmitJobCorporateEmail() {
        EmployerJobSubmissionRequest req = createValidRequest();

        when(phishSenseClient.scanUrl(anyString(), anyString())).thenReturn(
                new PhishSenseClient.PhishSenseScanResult(RiskLabel.LOW_RISK, 0, List.of(), "SSRF Guard", false)
        );

        when(submissionRepository.findByReferenceId(anyString())).thenReturn(Optional.empty());

        when(submissionRepository.save(any(EmployerJobSubmission.class))).thenAnswer(invocation -> {
            EmployerJobSubmission s = invocation.getArgument(0);
            s.setId(100L);
            return s;
        });

        EmployerJobSubmissionResponse response = service.submitJob(req);

        assertNotNull(response);
        assertNotNull(response.referenceId());
        assertTrue(response.referenceId().startsWith("NR-2026-"));
        assertEquals(SubmissionStatus.PENDING_VERIFICATION, response.status());
        assertNotNull(response.submittedAt());

        // Verify submission saved
        ArgumentCaptor<EmployerJobSubmission> subCaptor = ArgumentCaptor.forClass(EmployerJobSubmission.class);
        verify(submissionRepository).save(subCaptor.capture());
        EmployerJobSubmission savedSub = subCaptor.getValue();
        assertEquals("Swiggy", savedSub.getCompanyName());
        assertEquals("rahul@swiggy.com", savedSub.getRecruiterEmail());
        assertEquals(LocalDateTime.of(2026, 11, 30, 23, 59, 59), savedSub.getDeadline());

        // Verify history saved and bidirectionally linked
        ArgumentCaptor<SubmissionStatusHistory> histCaptor = ArgumentCaptor.forClass(SubmissionStatusHistory.class);
        verify(historyRepository).save(histCaptor.capture());
        SubmissionStatusHistory savedHist = histCaptor.getValue();
        assertEquals(SubmissionStatus.PENDING_VERIFICATION, savedHist.getToStatus());
        assertEquals(savedSub, savedHist.getSubmission());
        assertTrue(savedSub.getStatusHistory().contains(savedHist));
    }

    @Test
    @DisplayName("submitJob permits personal email (@gmail.com) and notes manual review requirement")
    void testSubmitJobPersonalEmailAllowed() {
        EmployerJobSubmissionRequest req = createValidRequest();
        req.setRecruiterEmail("recruiter.rahul@gmail.com");

        when(phishSenseClient.scanUrl(anyString(), anyString())).thenReturn(
                new PhishSenseClient.PhishSenseScanResult(RiskLabel.LOW_RISK, 0, List.of(), "SSRF Guard", false)
        );

        when(submissionRepository.findByReferenceId(anyString())).thenReturn(Optional.empty());

        when(submissionRepository.save(any(EmployerJobSubmission.class))).thenAnswer(invocation -> {
            EmployerJobSubmission s = invocation.getArgument(0);
            s.setId(101L);
            return s;
        });

        EmployerJobSubmissionResponse response = service.submitJob(req);

        assertNotNull(response);
        assertEquals(SubmissionStatus.PENDING_VERIFICATION, response.status());

        ArgumentCaptor<SubmissionStatusHistory> histCaptor = ArgumentCaptor.forClass(SubmissionStatusHistory.class);
        verify(historyRepository).save(histCaptor.capture());
        assertTrue(histCaptor.getValue().getNotes().contains("Personal email"));
    }

    @Test
    @DisplayName("submitJob rejects disposable email domains with IllegalArgumentException")
    void testSubmitJobDisposableEmailRejected() {
        EmployerJobSubmissionRequest req = createValidRequest();
        req.setRecruiterEmail("hacker@tempmail.com");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.submitJob(req));
        assertTrue(ex.getMessage().contains("Disposable email"));
        verifyNoInteractions(phishSenseClient);
        verify(submissionRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitJob flags malicious or high-threat scan results for security review")
    void testSubmitJobFlaggedForSecurityReview() {
        EmployerJobSubmissionRequest req = createValidRequest();
        req.setApplyUrl("https://lookalike-phishing.top/apply");

        when(phishSenseClient.scanUrl(anyString(), anyString())).thenReturn(
                new PhishSenseClient.PhishSenseScanResult(RiskLabel.MALICIOUS, 85, List.of("HIGH_RISK_TLD"), "SSRF Guard", false)
        );

        when(submissionRepository.findByReferenceId(anyString())).thenReturn(Optional.empty());

        when(submissionRepository.save(any(EmployerJobSubmission.class))).thenAnswer(invocation -> {
            EmployerJobSubmission s = invocation.getArgument(0);
            s.setId(102L);
            return s;
        });

        EmployerJobSubmissionResponse response = service.submitJob(req);

        assertNotNull(response);
        assertEquals(SubmissionStatus.FLAGGED_FOR_SECURITY_REVIEW, response.status());
    }
}
