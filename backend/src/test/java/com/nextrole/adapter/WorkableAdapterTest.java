package com.nextrole.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrole.config.AppProperties;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.sync.adapter.WorkableAdapter;
import com.nextrole.sync.model.NormalizedJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WorkableAdapterTest {

    private WorkableAdapter adapter;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AppProperties appProperties = new AppProperties();
        objectMapper = new ObjectMapper();
        adapter = new WorkableAdapter(appProperties, objectMapper);
    }

    @Test
    @DisplayName("Successfully normalizes standard Workable job posting")
    void testNormalizePosting() throws Exception {
        String json = """
            {
                "shortcode": "WRK-501",
                "title": "React Frontend Engineer",
                "city": "Hyderabad",
                "country": "India",
                "employment_type": "full_time",
                "published": "2026-10-25T12:00:00Z",
                "url": "https://apply.workable.com/cred/j/WRK-501/"
            }
            """;

        JsonNode node = objectMapper.readTree(json);
        NormalizedJob job = adapter.normalizePosting(node, "cred");

        assertThat(job).isNotNull();
        assertThat(job.sourceJobId()).isEqualTo("WRK-501");
        assertThat(job.title()).isEqualTo("React Frontend Engineer");
        assertThat(job.location()).isEqualTo("Hyderabad, India");
        assertThat(job.country()).isEqualTo("India");
        assertThat(job.jobType()).isEqualTo(JobType.FULL_TIME);
        assertThat(job.applyUrl()).isEqualTo("https://apply.workable.com/cred/j/WRK-501/");
    }
}
