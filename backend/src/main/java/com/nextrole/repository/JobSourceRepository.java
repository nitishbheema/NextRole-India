package com.nextrole.repository;

import com.nextrole.entity.JobSource;
import com.nextrole.enums.SourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobSourceRepository extends JpaRepository<JobSource, Long> {

    List<JobSource> findByEnabledTrue();

    List<JobSource> findByCompanyId(Long companyId);

    List<JobSource> findByCompanyIdAndSourceType(Long companyId, SourceType sourceType);

    @Query("SELECT js FROM JobSource js JOIN FETCH js.company WHERE js.enabled = true ORDER BY js.company.name")
    List<JobSource> findAllEnabledWithCompany();

    boolean existsByCompanyIdAndSourceTypeAndBoardIdentifier(Long companyId, SourceType sourceType, String boardIdentifier);
}
