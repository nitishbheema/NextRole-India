package com.nextrole.controller;

import com.nextrole.dto.JobDetailDto;
import com.nextrole.dto.JobDto;
import com.nextrole.dto.PagedResponse;
import com.nextrole.exception.ResourceNotFoundException;
import com.nextrole.service.JobService;
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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = JobController.class)
@AutoConfigureMockMvc(addFilters = false) // bypass security filters for controller slice test
@ActiveProfiles("test")
class JobControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JobService jobService;

    @Test
    @DisplayName("GET /api/jobs returns paginated active listings")
    void testGetJobs() throws Exception {
        JobDto jobDto = new JobDto(
                1L, "Software Engineer", "Thoughtworks", "https://logo.png",
                "Bengaluru", "India", "FULL_TIME", "FRESHER",
                "HYBRID", "https://apply.url", LocalDateTime.now(),
                LocalDateTime.now(), LocalDateTime.now()
        );

        PagedResponse<JobDto> pagedResponse = new PagedResponse<>(
                List.of(jobDto), 0, 20, 1, 1, false, false
        );

        when(jobService.getJobs(any())).thenReturn(pagedResponse);

        mockMvc.perform(get("/api/jobs")
                        .param("q", "Software")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").isEqualTo("Software Engineer"))
                .andExpect(jsonPath("$.totalElements").isEqualTo(1));
    }

    @Test
    @DisplayName("GET /api/jobs/{id} returns 404 if job is expired or not found")
    void testGetJobByIdNotFoundOrExpired() throws Exception {
        when(jobService.getJobById(999L))
                .thenThrow(new ResourceNotFoundException("Job has expired or is no longer available."));

        mockMvc.perform(get("/api/jobs/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Job has expired or is no longer available."));
    }

    @Test
    @DisplayName("GET /api/jobs/fresher returns fresher jobs list")
    void testGetFresherJobs() throws Exception {
        JobDto fresherJob = new JobDto(
                2L, "Associate Developer", "Thoughtworks", null,
                "Pune", "India", "FULL_TIME", "FRESHER",
                "ONSITE", "https://apply.url/fresher", LocalDateTime.now(),
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(jobService.getFresherJobs(10)).thenReturn(List.of(fresherJob));

        mockMvc.perform(get("/api/jobs/fresher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").isEqualTo("Associate Developer"))
                .andExpect(jsonPath("$[0].experienceLevel").isEqualTo("FRESHER"));
    }
}
