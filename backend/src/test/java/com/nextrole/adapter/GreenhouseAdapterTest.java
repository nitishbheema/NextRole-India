package com.nextrole.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.config.AppProperties;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.WorkMode;
import com.nextrole.sync.adapter.GreenhouseAdapter;
import com.nextrole.sync.model.NormalizedJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GreenhouseAdapterTest {

    private GreenhouseAdapter adapter;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        objectMapper = new ObjectMapper();
        adapter = new GreenhouseAdapter(appProperties, objectMapper);
    }

    @Test
    @DisplayName("Successfully normalizes standard Greenhouse job node")
    void testNormalizeJob() throws Exception {
        String json = """
            {
                "id": "123456",
                "title": "Senior Software Engineer - Java",
                "absolute_url": "https://boards.greenhouse.io/thoughtworks/jobs/123456",
                "content": "<p>We are looking for a Senior Java Developer</p>",
                "updated_at": "2026-10-25T10:00:00-04:00",
                "location": {
                    "name": "Bengaluru, Karnataka, India"
                }
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizeJob(node);

        assertThat(job).isNotNull();
        assertThat(job.sourceJobId()).isEqualTo("123456");
        assertThat(job.title()).isEqualTo("Senior Software Engineer - Java");
        assertThat(job.location()).isEqualTo("Bengaluru, Karnataka, India");
        assertThat(job.country()).isEqualTo("India");
        assertThat(job.jobType()).isEqualTo(JobType.FULL_TIME);
        assertThat(job.experienceLevel()).isEqualTo(ExperienceLevel.SENIOR);
        assertThat(job.applyUrl()).isEqualTo("https://boards.greenhouse.io/thoughtworks/jobs/123456");
        assertThat(job.closed()).isFalse();
    }

    @Test
    @DisplayName("Correctly infers Fresher and Internship types from job title")
    void testInferInternshipAndFresher() throws Exception {
        String json = """
            {
                "id": "78910",
                "title": "Graduate Software Engineer Trainee - Fresher",
                "absolute_url": "https://boards.greenhouse.io/thoughtworks/jobs/78910",
                "content": "Fresher batch recruitment",
                "location": {
                    "name": "Remote - India"
                }
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizeJob(node);

        assertThat(job).isNotNull();
        assertThat(job.jobType()).isEqualTo(JobType.GRADUATE_PROGRAMME);
        assertThat(job.experienceLevel()).isEqualTo(ExperienceLevel.FRESHER);
        assertThat(job.workMode()).isEqualTo(WorkMode.REMOTE);
    }

    @Test
    @DisplayName("Returns null when id is missing or blank")
    void testMissingId() throws Exception {
        String json = """
            {
                "id": "",
                "title": "Software Engineer",
                "absolute_url": "https://boards.greenhouse.io/thoughtworks/jobs/123"
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizeJob(node);

        assertThat(job).isNull();
    }
}
