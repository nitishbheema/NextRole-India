package com.nextrole.repository;

import com.nextrole.entity.SubmissionStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionStatusHistoryRepository extends JpaRepository<SubmissionStatusHistory, Long> {
    List<SubmissionStatusHistory> findBySubmissionIdOrderByCreatedAtDesc(Long submissionId);
}
