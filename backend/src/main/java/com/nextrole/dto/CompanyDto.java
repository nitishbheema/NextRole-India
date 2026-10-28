package com.nextrole.dto;

public record CompanyDto(
        Long id,
        String name,
        String logoUrl,
        String careersUrl,
        long activeJobCount
) {}
