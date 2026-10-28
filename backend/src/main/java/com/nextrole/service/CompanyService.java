package com.nextrole.service;

import com.nextrole.dto.CompanyDto;
import com.nextrole.entity.Company;
import com.nextrole.exception.ResourceNotFoundException;
import com.nextrole.repository.CompanyRepository;
import com.nextrole.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

    public List<CompanyDto> getAllCompanies() {
        List<Company> companies = companyRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        return companies.stream()
                .map(c -> {
                    long activeJobs = jobRepository.countActiveByCompanyId(c.getId());
                    return new CompanyDto(c.getId(), c.getName(), c.getLogoUrl(), c.getCareersUrl(), activeJobs);
                })
                .toList();
    }

    public CompanyDto getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        long activeJobs = jobRepository.countActiveByCompanyId(company.getId());
        return new CompanyDto(company.getId(), company.getName(), company.getLogoUrl(), company.getCareersUrl(), activeJobs);
    }

    @Transactional
    public CompanyDto createCompany(String name, String logoUrl, String careersUrl) {
        if (companyRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Company with name '" + name + "' already exists.");
        }
        Company company = Company.builder()
                .name(name.trim())
                .logoUrl(logoUrl != null && !logoUrl.isBlank() ? logoUrl.trim() : null)
                .careersUrl(careersUrl.trim())
                .build();
        Company saved = companyRepository.save(company);
        return new CompanyDto(saved.getId(), saved.getName(), saved.getLogoUrl(), saved.getCareersUrl(), 0);
    }
}
