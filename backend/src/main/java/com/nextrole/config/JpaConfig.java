package com.nextrole.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.nextrole.repository")
public class JpaConfig {
    // JPA is auto-configured by Spring Boot; this class enables explicit repository scanning.
}
