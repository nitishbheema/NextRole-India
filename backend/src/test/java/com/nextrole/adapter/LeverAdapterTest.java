package com.nextrole.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.config.AppProperties;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.WorkMode;
import com.nextrole.sync.adapter.LeverAdapter;
import com.nextrole.sync.model.NormalizedJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class LeverAdapterTest {

    private LeverAdapter adapter;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        objectMapper = new ObjectMapper();
        adapter = new LeverAdapter(appProperties, objectMapper);
    }

    @Test
    @DisplayName("Successfully normalizes open Lever job posting")
    void testNormalizeOpenPosting() throws Exception {
        String json = """
            {
                "id": "lever-101",
                "text": "Junior Python Developer",
                "hostedUrl": "https://jobs.lever.co/gojek/lever-101",
                "descriptionPlain": "Build robust Python services",
                "state": "published",
                "createdAt": 1729850000000,
                "categories": {
                    "location": "Gurugram, India",
                    "team": "Engineering",
                    "commitment": "Full time"
                }
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "gojek");

        assertThat(job).isNotNull();
        assertThat(job.sourceJobId()).isEqualTo("lever-101");
        assertThat(job.title()).isEqualTo("Junior Python Developer");
        assertThat(job.location()).isEqualTo("Gurugram, India");
        assertThat(job.country()).isEqualTo("India");
        assertThat(job.jobType()).isEqualTo(JobType.FULL_TIME);
        assertThat(job.experienceLevel()).isEqualTo(ExperienceLevel.JUNIOR);
        assertThat(job.closed()).isFalse();
    }

    @Test
    @DisplayName("Detects authoritatively closed job in Lever API")
    void testNormalizeClosedPosting() throws Exception {
        String json = """
            {
                "id": "lever-closed-202",
                "text": "QA Automation Engineer",
                "hostedUrl": "https://jobs.lever.co/gojek/lever-closed-202",
                "descriptionPlain": "Testing role",
                "state": "closed",
                "createdAt": 1729000000000,
                "categories": {
                    "location": "Bengaluru",
                    "commitment": "Intern"
                }
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "gojek");

        assertThat(job).isNotNull();
        assertThat(job.closed()).isTrue();
        assertThat(job.jobType()).isEqualTo(JobType.INTERNSHIP);
    }

    @Test
    @DisplayName("Blank location in Lever is classified as Unknown and not India")
    void testBlankLocationNotIndia() throws Exception {
        String json = """
            {
                "id": "lever-blank",
                "text": "Developer",
                "hostedUrl": "https://jobs.lever.co/gojek/lever-blank",
                "categories": {}
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "gojek");

        assertThat(job).isNotNull();
        assertThat(job.country()).isEqualTo("Unknown");
    }
}
