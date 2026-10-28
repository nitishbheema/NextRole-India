package com.nextrole.dto.admin;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateSourceRequest {

    private String boardIdentifier;
    private Boolean enabled;
}
