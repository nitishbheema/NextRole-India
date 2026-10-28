package com.nextrole.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sync_runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_id", nullable = false)
    private JobSource source;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * Status values: "RUNNING", "SUCCESS", "FAILED", "PARTIAL"
     */
    @Column(nullable = false, length = 20)
    private String status;

    @Builder.Default
    @Column(name = "jobs_found", nullable = false)
    private int jobsFound = 0;

    @Builder.Default
    @Column(name = "jobs_created", nullable = false)
    private int jobsCreated = 0;

    @Builder.Default
    @Column(name = "jobs_updated", nullable = false)
    private int jobsUpdated = 0;

    @Builder.Default
    @Column(name = "jobs_expired", nullable = false)
    private int jobsExpired = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
