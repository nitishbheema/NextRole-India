package com.nextrole.dto;

import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.WorkMode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JobFilterRequest {

    private String q;
    private Long company;
    private String location;
    private JobType jobType;
    private ExperienceLevel experienceLevel;
    private WorkMode workMode;
    private String category;
    private String country = "India";
    private int page = 0;
    private int size = 20;
    private String sort = "publishedAt";

    public String getCountry() {
        if (country == null || country.trim().isEmpty()) {
            return "India";
        }
        return country.trim();
    }

    public int getValidatedSize() {
        return Math.min(Math.max(size, 1), 50);
    }

    public int getValidatedPage() {
        return Math.max(page, 0);
    }
}
