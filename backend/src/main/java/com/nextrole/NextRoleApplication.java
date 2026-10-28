package com.nextrole;

import com.nextrole.config.AppProperties;
import com.nextrole.sync.SyncRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class NextRoleApplication {

    public static void main(String[] args) {
        SpringApplication.run(NextRoleApplication.class, args);
    }
}
