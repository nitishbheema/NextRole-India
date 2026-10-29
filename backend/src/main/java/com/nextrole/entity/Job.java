package com.nextrole.entity;

import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobStatus;
import com.nextrole.enums.JobType;
import com.nextrole.enums.WorkMode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_id", nullable = false)
    private JobSource source;

    @Column(name = "source_job_id", nullable = false, length = 512)
    private String sourceJobId;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 512)
    private String location;

    @Builder.Default
    @Column(length = 100)
    private String country = "Unknown";

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", length = 50)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 50)
    private ExperienceLevel experienceLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", length = 50)
    private WorkMode workMode;

    @Column(name = "salary_min", precision = 15, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 15, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "salary_currency", length = 10)
    private String salaryCurrency;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "application_deadline")
    private LocalDateTime applicationDeadline;

    @Column(name = "apply_url", nullable = false, length = 2048)
    private String applyUrl;

    @Column(name = "source_url", length = 2048)
    private String sourceUrl;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status = JobStatus.ACTIVE;

    @Column(name = "first_seen_at", nullable = false)
    private LocalDateTime firstSeenAt;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

    @Column(name = "last_verified_at", nullable = false)
    private LocalDateTime lastVerifiedAt;

    @Builder.Default
    @Column(name = "missing_from_source_count", nullable = false)
    private int missingFromSourceCount = 0;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "expired_reason", length = 512)
    private String expiredReason;

    @Builder.Default
    @Column(name = "is_employer_submitted", nullable = false)
    private boolean isEmployerSubmitted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
