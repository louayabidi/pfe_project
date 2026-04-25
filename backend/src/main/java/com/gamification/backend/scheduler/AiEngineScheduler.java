package com.gamification.backend.scheduler;

import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.service.AiEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiEngineScheduler {

    private final AiEngineService aiEngineService;
    private final AppRepository   appRepository;

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void runDailyEngine() {
        log.info("[AI Scheduler] Starting daily engine run");

        appRepository.findAll().forEach(app -> {
            try {
                aiEngineService.runEngineForApp(app.getId());
            } catch (Exception e) {
                log.error("[AI Scheduler] Failed for app#{}: {}",
                    app.getId(), e.getMessage());
            }
        });

        log.info("[AI Scheduler] Daily run complete");
    }

    // Scores outcomes every Monday at 10:00 AM
    @Scheduled(cron = "0 0 10 * * MON")
    public void scoreWeeklyOutcomes() {
        log.info("[AI Scheduler] Scoring weekly outcomes");
        try {
            aiEngineService.scoreOutcomes();
        } catch (Exception e) {
            log.error("[AI Scheduler] Outcome scoring failed: {}", e.getMessage());
        }
    }
}