package com.nextrole.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.config.AppProperties;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.WorkMode;
import com.nextrole.sync.adapter.SmartRecruitersAdapter;
import com.nextrole.sync.model.NormalizedJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SmartRecruitersAdapterTest {

    private SmartRecruitersAdapter adapter;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        objectMapper = new ObjectMapper();
        adapter = new SmartRecruitersAdapter(appProperties, objectMapper);
    }

    @Test
    @DisplayName("Successfully normalizes standard SmartRecruiters posting")
    void testNormalizePosting() throws Exception {
        String json = """
            {
                "id": "sr-9988",
                "name": "Junior Java Developer",
                "location": {
                    "city": "Bengaluru",
                    "region": "Karnataka",
                    "country": "India"
                },
                "typeOfEmployment": {
                    "label": "Full-time"
                },
                "releasedDate": "2026-10-25T10:00:00Z"
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "bosch");

        assertThat(job).isNotNull();
        assertThat(job.sourceJobId()).isEqualTo("sr-9988");
        assertThat(job.title()).isEqualTo("Junior Java Developer");
        assertThat(job.location()).contains("Bengaluru");
        assertThat(job.country()).isEqualTo("India");
        assertThat(job.jobType()).isEqualTo(JobType.FULL_TIME);
        assertThat(job.experienceLevel()).isEqualTo(ExperienceLevel.FRESHER);
        assertThat(job.applyUrl()).isEqualTo("https://jobs.smartrecruiters.com/bosch/sr-9988");
    }

    @Test
    @DisplayName("Blank location in SmartRecruiters is classified as Unknown and not India")
    void testBlankLocationNotIndia() throws Exception {
        String json = """
            {
                "id": "sr-blank",
                "name": "Developer",
                "location": {}
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "bosch");

        assertThat(job).isNotNull();
        assertThat(job.country()).isEqualTo("Unknown");
    }
}
