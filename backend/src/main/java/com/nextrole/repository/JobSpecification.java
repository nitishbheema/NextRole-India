package com.nextrole.repository;

import com.nextrole.dto.JobFilterRequest;
import com.nextrole.entity.Job;
import com.nextrole.enums.JobStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    public static Specification<Job> withFilters(JobFilterRequest request) {
        return (root, query, cb) -> {
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("company", jakarta.persistence.criteria.JoinType.LEFT);
                root.fetch("source", jakarta.persistence.criteria.JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            // Always only show ACTIVE jobs to public visitors
            predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));

            // Keyword filter (title or description)
            if (request.getQ() != null && !request.getQ().trim().isEmpty()) {
                String searchPattern = "%" + request.getQ().trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(titleMatch, descMatch));
            }

            // Company filter
            if (request.getCompany() != null) {
                predicates.add(cb.equal(root.get("company").get("id"), request.getCompany()));
            }

            // Location filter
            if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
                String locPattern = "%" + request.getLocation().trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("location")), locPattern));
            }

            // JobType filter
            if (request.getJobType() != null) {
                predicates.add(cb.equal(root.get("jobType"), request.getJobType()));
            }

            // ExperienceLevel filter
            if (request.getExperienceLevel() != null) {
                predicates.add(cb.equal(root.get("experienceLevel"), request.getExperienceLevel()));
            }

            // WorkMode filter
            if (request.getWorkMode() != null) {
                predicates.add(cb.equal(root.get("workMode"), request.getWorkMode()));
            }

            // Country filter (default India; 'ALL' or 'all' returns global)
            String targetCountry = request.getCountry();
            if (targetCountry != null && !targetCountry.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(cb.lower(root.get("country")), targetCountry.toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
