package com.nextrole.repository;

import com.nextrole.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByName(String name);

    @Query("SELECT DISTINCT c FROM Company c JOIN c.jobSources js WHERE js.enabled = true ORDER BY c.name")
    List<Company> findCompaniesWithEnabledSources();
}
