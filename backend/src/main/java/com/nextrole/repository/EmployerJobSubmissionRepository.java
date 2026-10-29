package com.nextrole.repository;

import com.nextrole.entity.EmployerJobSubmission;
import com.nextrole.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployerJobSubmissionRepository extends JpaRepository<EmployerJobSubmission, Long> {

    Optional<EmployerJobSubmission> findByReferenceId(String referenceId);

    Page<EmployerJobSubmission> findByStatus(SubmissionStatus status, Pageable pageable);

    @Query("""
        SELECT s FROM EmployerJobSubmission s
        WHERE (:status IS NULL OR s.status = :status)
        ORDER BY s.createdAt DESC
        """)
    Page<EmployerJobSubmission> findAllWithStatusFilter(@Param("status") SubmissionStatus status, Pageable pageable);

    long countByStatus(SubmissionStatus status);
}
