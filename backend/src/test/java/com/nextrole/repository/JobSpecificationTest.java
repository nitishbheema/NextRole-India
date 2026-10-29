package com.nextrole.repository;

import com.nextrole.dto.JobFilterRequest;
import com.nextrole.entity.Company;
import com.nextrole.entity.Job;
import com.nextrole.entity.JobSource;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobStatus;
import com.nextrole.enums.JobType;
import com.nextrole.enums.SourceType;
import com.nextrole.enums.WorkMode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class JobSpecificationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private JobRepository jobRepository;

    private Company company1;
    private Company company2;
    private JobSource source1;

    @BeforeEach
    void setUp() {
        company1 = Company.builder()
                .name("Thoughtworks")
                .careersUrl("https://www.thoughtworks.com/careers")
                .build();
        company1 = entityManager.persistAndFlush(company1);

        company2 = Company.builder()
                .name("Freshworks")
                .careersUrl("https://www.freshworks.com/careers")
                .build();
        company2 = entityManager.persistAndFlush(company2);

        source1 = JobSource.builder()
                .company(company1)
                .sourceType(SourceType.GREENHOUSE)
                .boardIdentifier("thoughtworks")
                .enabled(true)
                .build();
        source1 = entityManager.persistAndFlush(source1);

        // Seed jobs
        Job job1 = Job.builder()
                .company(company1)
                .source(source1)
                .sourceJobId("tw-1")
                .title("Senior Java Developer")
                .description("Spring Boot microservices in Bengaluru")
                .location("Bengaluru, India")
                .country("India")
                .jobType(JobType.FULL_TIME)
                .experienceLevel(ExperienceLevel.SENIOR)
                .workMode(WorkMode.HYBRID)
                .applyUrl("https://apply.tw/1")
                .status(JobStatus.ACTIVE)
                .publishedAt(LocalDateTime.now().minusDays(1))
                .firstSeenAt(LocalDateTime.now().minusDays(1))
                .lastSeenAt(LocalDateTime.now())
                .lastVerifiedAt(LocalDateTime.now())
                .build();
        entityManager.persist(job1);

        Job job2 = Job.builder()
                .company(company1)
                .source(source1)
                .sourceJobId("tw-2")
                .title("Graduate QA Engineer")
                .description("Automated testing with Cypress and Selenium")
                .location("Pune, India")
                .country("India")
                .jobType(JobType.FULL_TIME)
                .experienceLevel(ExperienceLevel.FRESHER)
                .workMode(WorkMode.ONSITE)
                .applyUrl("https://apply.tw/2")
                .status(JobStatus.ACTIVE)
                .publishedAt(LocalDateTime.now().minusDays(2))
                .firstSeenAt(LocalDateTime.now().minusDays(2))
                .lastSeenAt(LocalDateTime.now())
                .lastVerifiedAt(LocalDateTime.now())
                .build();
        entityManager.persist(job2);

        Job expiredJob = Job.builder()
                .company(company1)
                .source(source1)
                .sourceJobId("tw-expired")
                .title("Expired Python Developer")
                .description("Old role")
                .location("Bengaluru, India")
                .country("India")
                .jobType(JobType.FULL_TIME)
                .experienceLevel(ExperienceLevel.MID)
                .workMode(WorkMode.REMOTE)
                .applyUrl("https://apply.tw/expired")
                .status(JobStatus.EXPIRED)
                .publishedAt(LocalDateTime.now().minusDays(30))
                .firstSeenAt(LocalDateTime.now().minusDays(30))
                .lastSeenAt(LocalDateTime.now().minusDays(10))
                .lastVerifiedAt(LocalDateTime.now().minusDays(10))
                .build();
        entityManager.persist(expiredJob);

        entityManager.flush();
    }

    @Test
    @DisplayName("Fetch without filters returns all active jobs, excludes expired")
    void testFindAllWithoutFilters() {
        JobFilterRequest request = new JobFilterRequest();
        Specification<Job> spec = JobSpecification.withFilters(request);

        Page<Job> result = jobRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).extracting(Job::getTitle)
                .containsExactlyInAnyOrder("Senior Java Developer", "Graduate QA Engineer");
    }

    @Test
    @DisplayName("Search by keyword matches title or description case-insensitively")
    void testKeywordSearch() {
        JobFilterRequest request = new JobFilterRequest();
        request.setQ("selenium");
        Specification<Job> spec = JobSpecification.withFilters(request);

        Page<Job> result = jobRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Graduate QA Engineer");
    }

    @Test
    @DisplayName("Filter by experience level FRESHER")
    void testFilterByExperienceLevel() {
        JobFilterRequest request = new JobFilterRequest();
        request.setExperienceLevel(ExperienceLevel.FRESHER);
        Specification<Job> spec = JobSpecification.withFilters(request);

        Page<Job> result = jobRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Graduate QA Engineer");
    }

    @Test
    @DisplayName("Filter by location Bengaluru")
    void testFilterByLocation() {
        JobFilterRequest request = new JobFilterRequest();
        request.setLocation("Bengaluru");
        Specification<Job> spec = JobSpecification.withFilters(request);

        Page<Job> result = jobRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Senior Java Developer");
    }

    @Test
    @DisplayName("Filter by non-existent company returns empty page")
    void testFilterByNonExistentCompany() {
        JobFilterRequest request = new JobFilterRequest();
        request.setCompany(company2.getId());
        Specification<Job> spec = JobSpecification.withFilters(request);

        Page<Job> result = jobRepository.findAll(spec, PageRequest.of(0, 10));

        assertThat(result.getTotalElements()).isEqualTo(0);
    }
}
