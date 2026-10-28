package com.nextrole.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/job-categories")
public class CategoryController {

    public record CategoryInfo(String id, String name, String description, String icon, String queryKeyword) {}

    private static final List<CategoryInfo> CATEGORIES = List.of(
            new CategoryInfo(
                    "software-dev",
                    "Software Development",
                    "Java, Python, Full Stack, Frontend, Backend & Mobile roles",
                    "Code",
                    "Software"
            ),
            new CategoryInfo(
                    "data-ai",
                    "Data & AI",
                    "Data Science, Data Analyst, Machine Learning & AI Engineering",
                    "Cpu",
                    "Data"
            ),
            new CategoryInfo(
                    "qa-testing",
                    "Testing & QA",
                    "Manual, Automation, SDET & Quality Assurance roles",
                    "CheckCircle",
                    "QA"
            ),
            new CategoryInfo(
                    "cybersecurity",
                    "Cybersecurity",
                    "Security Analyst, SOC, Penetration Testing & Infosec",
                    "Shield",
                    "Security"
            ),
            new CategoryInfo(
                    "cloud-devops",
                    "Cloud & DevOps",
                    "AWS, Azure, Kubernetes, CI/CD & Site Reliability",
                    "Cloud",
                    "DevOps"
            ),
            new CategoryInfo(
                    "internships",
                    "Internships & Graduate",
                    "Summer interns, fresh graduate programmes & apprenticeships",
                    "GraduationCap",
                    "Intern"
            )
    );

    @GetMapping
    public ResponseEntity<List<CategoryInfo>> getCategories() {
        return ResponseEntity.ok(CATEGORIES);
    }
}
