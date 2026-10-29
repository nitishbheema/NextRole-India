package com.nextrole.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.config.AppProperties;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.sync.adapter.AshbyAdapter;
import com.nextrole.sync.model.NormalizedJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AshbyAdapterTest {

    private AshbyAdapter adapter;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        objectMapper = new ObjectMapper();
        adapter = new AshbyAdapter(appProperties, objectMapper);
    }

    @Test
    @DisplayName("Successfully normalizes listed Ashby job posting")
    void testNormalizeListedPosting() throws Exception {
        String json = """
            {
                "id": "ashby-456",
                "title": "Staff Backend Engineer",
                "locationName": "Mumbai, India",
                "descriptionHtml": "<p>Lead architecture</p>",
                "employmentType": "FullTime",
                "isListed": true,
                "externalLink": "https://careers.cred.club/job/ashby-456"
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "cred");

        assertThat(job).isNotNull();
        assertThat(job.sourceJobId()).isEqualTo("ashby-456");
        assertThat(job.title()).isEqualTo("Staff Backend Engineer");
        assertThat(job.location()).isEqualTo("Mumbai, India");
        assertThat(job.country()).isEqualTo("India");
        assertThat(job.applyUrl()).isEqualTo("https://careers.cred.club/job/ashby-456");
        assertThat(job.jobType()).isEqualTo(JobType.FULL_TIME);
        assertThat(job.experienceLevel()).isEqualTo(ExperienceLevel.EXECUTIVE);
        assertThat(job.closed()).isFalse();
    }

    @Test
    @DisplayName("Filters out unlisted job posting in Ashby")
    void testFilterUnlistedPosting() throws Exception {
        String json = """
            {
                "id": "ashby-unlisted",
                "title": "Confidential Role",
                "isListed": false
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "cred");

        assertThat(job).isNull();
    }

    @Test
    @DisplayName("Blank location in Ashby is classified as Unknown and not India")
    void testBlankLocationNotIndia() throws Exception {
        String json = """
            {
                "id": "ashby-blank",
                "title": "Engineer",
                "locationName": "",
                "isListed": true
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "cred");

        assertThat(job).isNotNull();
        assertThat(job.country()).isEqualTo("Unknown");
    }
}
