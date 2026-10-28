package com.nextrole.sync;

import com.nextrole.entity.SyncRun;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * ApplicationRunner that checks for the --sync program argument.
 * <p>
 * When --sync is present: runs the full sync orchestration, logs summary, and exits.
 * When --sync is absent: does nothing; the app runs as a normal web server.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SyncRunner implements ApplicationRunner {

    private final JobSyncOrchestrator orchestrator;

    @Override
    public void run(ApplicationArguments args) {
        if (!args.containsOption("sync")) {
            log.info("Web server mode. Pass --sync to run job synchronization.");
            return;
        }

        log.info("=== NextRole Sync Mode ===");
        log.info("Starting full job synchronization...");

        try {
            List<SyncRun> results = orchestrator.syncAll();

            int totalCreated = 0, totalUpdated = 0, totalExpired = 0, totalFailed = 0;
            for (SyncRun run : results) {
                log.info("  Source id={} status={} found={} created={} updated={} expired={}",
                        run.getSource().getId(), run.getStatus(),
                        run.getJobsFound(), run.getJobsCreated(),
                        run.getJobsUpdated(), run.getJobsExpired());
                totalCreated += run.getJobsCreated();
                totalUpdated += run.getJobsUpdated();
                totalExpired += run.getJobsExpired();
                if ("FAILED".equals(run.getStatus())) totalFailed++;
            }

            log.info("=== Sync Summary: sources={} failed={} created={} updated={} expired={} ===",
                    results.size(), totalFailed, totalCreated, totalUpdated, totalExpired);

            if (totalFailed > 0) {
                log.warn("Some sources failed. Exiting with code 1.");
                System.exit(1);
            } else {
                log.info("Sync completed successfully. Exiting with code 0.");
                System.exit(0);
            }
        } catch (Exception e) {
            log.error("Fatal error during sync: {}", e.getMessage(), e);
            System.exit(1);
        }
    }
}
