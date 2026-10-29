package com.nextrole.entity;

import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.RiskLabel;
import com.nextrole.enums.SubmissionStatus;
import com.nextrole.enums.WorkMode;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employer_job_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerJobSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_id", nullable = false, unique = true, length = 64)
    private String referenceId;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_website", nullable = false, length = 1024)
    private String companyWebsite;

    @Column(name = "recruiter_name", nullable = false)
    private String recruiterName;

    @Column(name = "recruiter_email", nullable = false)
    private String recruiterEmail;

    @Column(name = "job_title", nullable = false, length = 512)
    private String jobTitle;

    @Column(name = "job_description", nullable = false, columnDefinition = "TEXT")
    private String jobDescription;

    @Column(length = 512)
    private String location;

    @Builder.Default
    @Column(length = 100)
    private String country = "India";

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", length = 50)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 50)
    private ExperienceLevel experienceLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", length = 50)
    private WorkMode workMode;

    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    @Column(name = "apply_url", nullable = false, length = 2048)
    private String applyUrl;

    @Column(name = "official_job_url", length = 2048)
    private String officialJobUrl;

    private LocalDateTime deadline;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SubmissionStatus status = SubmissionStatus.PENDING_VERIFICATION;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_label", nullable = false, length = 50)
    private RiskLabel riskLabel = RiskLabel.UNKNOWN;

    @Builder.Default
    @Column(name = "threat_score", nullable = false)
    private int threatScore = 0;

    @Column(name = "risk_details", columnDefinition = "TEXT")
    private String riskDetails;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "reviewer_username", length = 100)
    private String reviewerUsername;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_job_id")
    private Job publishedJob;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<SubmissionStatusHistory> statusHistory = new ArrayList<>();

    public void addStatusHistory(SubmissionStatusHistory history) {
        if (this.statusHistory == null) {
            this.statusHistory = new ArrayList<>();
        }
        this.statusHistory.add(history);
        history.setSubmission(this);
    }
}
