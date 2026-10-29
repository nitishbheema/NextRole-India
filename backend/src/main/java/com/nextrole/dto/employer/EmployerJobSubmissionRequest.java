package com.nextrole.dto.employer;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.nextrole.config.LenientLocalDateTimeDeserializer;
import com.nextrole.enums.ExperienceLevel;
import com.nextrole.enums.JobType;
import com.nextrole.enums.WorkMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EmployerJobSubmissionRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 255)
    private String companyName;

    @NotBlank(message = "Company website is required")
    @Size(max = 1024)
    private String companyWebsite;

    @NotBlank(message = "Recruiter name is required")
    @Size(max = 255)
    private String recruiterName;

    @NotBlank(message = "Recruiter email is required")
    @Email(message = "Valid recruiter email is required")
    @Size(max = 255)
    private String recruiterEmail;

    @NotBlank(message = "Job title is required")
    @Size(max = 512)
    private String jobTitle;

    @NotBlank(message = "Job description is required")
    private String jobDescription;

    @NotBlank(message = "Location is required")
    @Size(max = 512)
    private String location;

    private String country = "India";

    @NotNull(message = "Employment type is required")
    private JobType jobType;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    @NotNull(message = "Work mode is required")
    private WorkMode workMode;

    private String salaryRange;

    @NotBlank(message = "Application URL is required")
    @Size(max = 2048)
    private String applyUrl;

    private String officialJobUrl;

    @JsonDeserialize(using = LenientLocalDateTimeDeserializer.class)
    private LocalDateTime deadline;

    @NotNull(message = "Consent is required")
    private Boolean authorizedConsent;
}
