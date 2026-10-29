package com.nextrole.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.dto.employer.EmployerJobSubmissionRequest;
import com.nextrole.dto.employer.EmployerJobSubmissionResponse;
import com.nextrole.dto.employer.SubmissionStatusResponse;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.SubmissionStatus;
import com.nextrole.enums.WorkMode;
import com.nextrole.exception.ResourceNotFoundException;
import com.nextrole.service.EmployerJobService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = EmployerJobController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class EmployerJobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmployerJobService employerJobService;

    @Test
    @DisplayName("POST /api/employer/jobs successfully submits job and returns reference ID")
    void testSubmitJobSuccess() throws Exception {
        EmployerJobSubmissionRequest request = new EmployerJobSubmissionRequest();
        request.setCompanyName("PhonePe");
        request.setCompanyWebsite("https://www.phonepe.com");
        request.setRecruiterName("Priya Sharma");
        request.setRecruiterEmail("priya@phonepe.com");
        request.setJobTitle("Software Engineer - Backend");
        request.setJobDescription("Build highly scalable UPI payment systems");
        request.setLocation("Bengaluru, Karnataka, India");
        request.setJobType(JobType.FULL_TIME);
        request.setExperienceLevel(ExperienceLevel.JUNIOR);
        request.setWorkMode(WorkMode.HYBRID);
        request.setApplyUrl("https://www.phonepe.com/careers/job-123");
        request.setAuthorizedConsent(true);

        EmployerJobSubmissionResponse response = new EmployerJobSubmissionResponse(
                "NR-2026-ABC123",
                SubmissionStatus.PENDING_VERIFICATION,
                "Under verification",
                LocalDateTime.now()
        );

        when(employerJobService.submitJob(any())).thenReturn(response);

        mockMvc.perform(post("/api/employer/jobs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.referenceId").value("NR-2026-ABC123"))
                .andExpect(jsonPath("$.status").value("PENDING_VERIFICATION"));
    }

    @Test
    @DisplayName("GET /api/employer/jobs/status/{ref} returns safe submission status")
    void testGetSubmissionStatus() throws Exception {
        SubmissionStatusResponse response = new SubmissionStatusResponse(
                "NR-2026-XYZ999",
                "Razorpay",
                "Staff SRE",
                SubmissionStatus.UNDER_REVIEW,
                LocalDateTime.now().minusHours(2),
                LocalDateTime.now()
        );

        when(employerJobService.getSubmissionStatus("NR-2026-XYZ999")).thenReturn(response);

        mockMvc.perform(get("/api/employer/jobs/status/NR-2026-XYZ999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.referenceId").value("NR-2026-XYZ999"))
                .andExpect(jsonPath("$.companyName").value("Razorpay"))
                .andExpect(jsonPath("$.status").value("UNDER_REVIEW"));
    }

    @Test
    @DisplayName("GET /api/employer/jobs/status/{ref} returns 404 if not found")
    void testGetSubmissionStatusNotFound() throws Exception {
        when(employerJobService.getSubmissionStatus("NR-NONEXISTENT"))
                .thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/employer/jobs/status/NR-NONEXISTENT"))
                .andExpect(status().isNotFound());
    }
}
