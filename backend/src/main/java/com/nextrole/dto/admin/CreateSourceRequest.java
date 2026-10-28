package com.nextrole.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateSourceRequest {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Source type is required")
    private String sourceType;

    @NotBlank(message = "Board identifier is required")
    private String boardIdentifier;

    private boolean enabled = true;
}
