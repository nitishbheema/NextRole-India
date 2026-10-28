package com.nextrole.repository;

import com.nextrole.entity.SyncRun;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyncRunRepository extends JpaRepository<SyncRun, Long> {

    @Query("SELECT sr FROM SyncRun sr JOIN FETCH sr.source s JOIN FETCH s.company ORDER BY sr.startedAt DESC")
    List<SyncRun> findRecentRuns(Pageable pageable);

    @Query("SELECT sr FROM SyncRun sr WHERE sr.source.id = :sourceId ORDER BY sr.startedAt DESC")
    List<SyncRun> findBySourceIdOrderByStartedAtDesc(@Param("sourceId") Long sourceId, Pageable pageable);
}
