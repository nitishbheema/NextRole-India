package com.nextrole.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
@Getter
@Setter
public class AppProperties {

    private Cors cors = new Cors();
    private Admin admin = new Admin();
    private Sync sync = new Sync();

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins = "http://localhost:5173";
    }

    @Getter
    @Setter
    public static class Admin {
        private String username = "admin";
        private String password = "changeme";
    }

    @Getter
    @Setter
    public static class Sync {
        private int httpTimeoutSeconds = 30;
        private int readTimeoutSeconds = 60;
        private int maxRetries = 3;
        private long retryDelayMs = 2000;
    }
}
