package com.nextrole.repository;

import com.nextrole.entity.Job;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobStatus;
import com.nextrole.enums.JobType;
import com.nextrole.enums.WorkMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    @Override
    @EntityGraph(attributePaths = {"company", "source"})
    Page<Job> findAll(Specification<Job> spec, Pageable pageable);

    Optional<Job> findBySourceIdAndSourceJobId(Long sourceId, String sourceJobId);

    List<Job> findBySourceId(Long sourceId);

    @Query("""
        SELECT j FROM Job j
        JOIN FETCH j.company c
        JOIN FETCH j.source s
        WHERE j.status = :status
          AND (:keyword IS NULL OR LOWER(j.title) LIKE CONCAT('%', LOWER(CAST(:keyword AS String)), '%')
               OR LOWER(j.description) LIKE CONCAT('%', LOWER(CAST(:keyword AS String)), '%'))
          AND (:companyId IS NULL OR c.id = :companyId)
          AND (:location IS NULL OR LOWER(j.location) LIKE CONCAT('%', LOWER(CAST(:location AS String)), '%'))
          AND (:jobType IS NULL OR j.jobType = :jobType)
          AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel)
          AND (:workMode IS NULL OR j.workMode = :workMode)
        """)
    Page<Job> findWithFilters(
            @Param("status") JobStatus status,
            @Param("keyword") String keyword,
            @Param("companyId") Long companyId,
            @Param("location") String location,
            @Param("jobType") JobType jobType,
            @Param("experienceLevel") ExperienceLevel experienceLevel,
            @Param("workMode") WorkMode workMode,
            Pageable pageable
    );

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.status = 'ACTIVE' AND j.firstSeenAt >= :since ORDER BY j.firstSeenAt DESC")
    List<Job> findFreshJobs(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.status = 'ACTIVE' AND j.experienceLevel = 'FRESHER' ORDER BY j.publishedAt DESC NULLS LAST")
    List<Job> findFresherJobs(Pageable pageable);

    @Query("SELECT j FROM Job j JOIN FETCH j.company WHERE j.status = 'ACTIVE' AND j.jobType = 'INTERNSHIP' ORDER BY j.publishedAt DESC NULLS LAST")
    List<Job> findInternshipJobs(Pageable pageable);

    @Query("""
        SELECT j FROM Job j
        WHERE j.source.id = :sourceId
          AND j.status IN ('ACTIVE', 'NEEDS_RECHECK')
          AND j.sourceJobId NOT IN :fetchedIds
        """)
    List<Job> findActiveJobsNotInFetchedSet(
            @Param("sourceId") Long sourceId,
            @Param("fetchedIds") List<String> fetchedIds
    );

    @Query("""
        SELECT j FROM Job j
        WHERE j.source.id = :sourceId
          AND j.status IN ('ACTIVE', 'NEEDS_RECHECK')
        """)
    List<Job> findActiveJobsBySource(@Param("sourceId") Long sourceId);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = :status")
    long countByStatus(@Param("status") JobStatus status);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.company.id = :companyId AND j.status = 'ACTIVE'")
    long countActiveByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT j.company.id, COUNT(j) FROM Job j WHERE j.status = 'ACTIVE' GROUP BY j.company.id")
    List<Object[]> countActiveGroupedByCompanyId();

    @Modifying
    @Query("""
        UPDATE Job j SET j.missingFromSourceCount = j.missingFromSourceCount + 1,
        j.status = 'NEEDS_RECHECK'
        WHERE j.id IN :ids
        """)
    void incrementMissingCountAndSetNeedsRecheck(@Param("ids") List<Long> ids);

    @Modifying
    @Query("""
        UPDATE Job j SET j.status = 'EXPIRED', j.expiredAt = :now, j.expiredReason = :reason
        WHERE j.id IN :ids
        """)
    void expireJobs(@Param("ids") List<Long> ids, @Param("now") LocalDateTime now, @Param("reason") String reason);
}
