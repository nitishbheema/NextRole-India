package com.nextrole.service;

import com.nextrole.sync.JobSyncOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
@Slf4j
public class SyncService {

    private final JobSyncOrchestrator orchestrator;
    private final AtomicBoolean isSyncRunning = new AtomicBoolean(false);

    /**
     * Triggers synchronization asynchronously if not already running.
     * @return true if sync was triggered, false if already in progress.
     */
    public boolean triggerSyncAsync() {
        if (!isSyncRunning.compareAndSet(false, true)) {
            log.warn("Sync trigger request rejected: Sync is already in progress.");
            return false;
        }

        CompletableFuture.runAsync(() -> {
            try {
                log.info("Starting asynchronous sync run triggered via Admin API...");
                orchestrator.syncAll();
            } catch (Exception e) {
                log.error("Error during asynchronous sync run: {}", e.getMessage(), e);
            } finally {
                isSyncRunning.set(false);
                log.info("Asynchronous sync run finished.");
            }
        });

        return true;
    }

    public boolean isSyncRunning() {
        return isSyncRunning.get();
    }
}
