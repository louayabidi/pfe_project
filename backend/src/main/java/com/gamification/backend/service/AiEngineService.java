package com.gamification.backend.service;

import com.gamification.backend.model.AiActionLog;
import com.gamification.backend.model.App;
import com.gamification.backend.model.PointsBalance;
import com.gamification.backend.repository.AiActionLogRepository;
import com.gamification.backend.repository.AnalyticsRepository;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.IncomingEventRepository;
import com.gamification.backend.repository.PointsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiEngineService {

    private final AnalyticsRepository    analyticsRepo;
    private final AiActionLogRepository  actionLogRepo;
    private final PointsRepository       pointsRepo;
    private final AppRepository          appRepo;
    private final IncomingEventRepository eventRepo;

    // ── Main entry point ─────────────────────────────────────────────────────

    @Transactional
    public void runEngineForApp(Long appId) {
        log.info("[AI] Running engine for app#{}", appId);

        List<Object[]> userSegments = analyticsRepo.findUserSegments(appId);
        log.info("[AI] Found {} users to evaluate", userSegments.size());

        for (Object[] row : userSegments) {
            String userId  = (String)  row[0];
            String segment = (String)  row[7]; // segment is the 8th column

            try {
                decideAndAct(appId, userId, segment);
            } catch (Exception e) {
                log.error("[AI] Error for user={} segment={}: {}", userId, segment, e.getMessage());
            }
        }
    }

    // ── Decision logic ───────────────────────────────────────────────────────

    private void decideAndAct(Long appId, String userId, String segment) {

        // Never act on the same user more than once per 7 days
        boolean recentAction = actionLogRepo.existsRecentAction(
            appId, userId, LocalDateTime.now().minusDays(7));

        if (recentAction) {
            log.debug("[AI] Skipping user={} — acted recently", userId);
            return;
        }

        switch (segment) {
            case "LURKER"       -> actOnLurker(appId, userId);
            case "EXPERIMENTER" -> actOnExperimenter(appId, userId);
            case "AT_RISK"      -> actOnAtRisk(appId, userId);
            case "CHURNED"      -> actOnChurned(appId, userId);
            case "MAINTAINER"   -> actOnMaintainer(appId, userId);
            case "POWER_USER"   -> actOnPowerUser(appId, userId);
            default             -> log.warn("[AI] Unknown segment: {}", segment);
        }
    }

    // ── One strategy per segment ─────────────────────────────────────────────

    private void actOnLurker(Long appId, String userId) {
        // They signed up but never really engaged — small gift to start
        awardPoints(appId, userId, 25, "Welcome bonus — get started!");
        logAction(appId, userId, "LURKER", "AWARD_WELCOME_BONUS",
            Map.of("points", 25, "reason", "zero_events"));
    }

    private void actOnExperimenter(Long appId, String userId) {
        // Tried it, drifted — nudge them back
        awardPoints(appId, userId, 50, "You've been missed — here's a boost!");
        logAction(appId, userId, "EXPERIMENTER", "AWARD_COMEBACK_BONUS",
            Map.of("points", 50, "reason", "low_recency"));
    }

    private void actOnAtRisk(Long appId, String userId) {
        // 14+ days silent — more aggressive
        awardPoints(appId, userId, 100, "Don't lose your progress — bonus points added!");
        logAction(appId, userId, "AT_RISK", "AWARD_RETENTION_BONUS",
            Map.of("points", 100, "reason", "14d_silence"));
    }

    private void actOnChurned(Long appId, String userId) {
        // 28+ days gone — last resort win-back
        awardPoints(appId, userId, 200, "We've added 200 points — come see what's new!");
        logAction(appId, userId, "CHURNED", "AWARD_WINBACK_BONUS",
            Map.of("points", 200, "reason", "28d_silence"));
    }

    private void actOnMaintainer(Long appId, String userId) {
        // Steady user — reward consistency quietly
        awardPoints(appId, userId, 30, "Consistency reward — keep it up!");
        logAction(appId, userId, "MAINTAINER", "AWARD_CONSISTENCY_BONUS",
            Map.of("points", 30, "reason", "steady_usage"));
    }

    private void actOnPowerUser(Long appId, String userId) {
        // Already engaged — just track them, don't over-reward
        logAction(appId, userId, "POWER_USER", "OBSERVED_POWER_USER",
            Map.of("reason", "high_engagement"));
        log.info("[AI] Power user noted: user={} app={}", userId, appId);
    }

    // ── Outcome scoring (called by scheduler weekly) ─────────────────────────

    @Transactional
    public void scoreOutcomes() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        List<AiActionLog> unscored = actionLogRepo.findUnscoredActions(cutoff);

        log.info("[AI] Scoring {} outcomes", unscored.size());

        for (AiActionLog entry : unscored) {
            boolean didReturn = eventRepo.existsByAppIdAndUserIdAfter(
                entry.getAppId(), entry.getUserId(), entry.getFiredAt());

            entry.setDidReturn(didReturn);
            entry.setOutcomeCheckedAt(LocalDateTime.now());
            actionLogRepo.save(entry);

            log.info("[AI] Outcome scored: user={} segment={} action={} didReturn={}",
                entry.getUserId(), entry.getSegment(), entry.getActionType(), didReturn);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void awardPoints(Long appId, String userId, int points, String reason) {
        App app = appRepo.findById(appId)
                .orElseThrow(() -> new RuntimeException("App not found: " + appId));

        PointsBalance bal = pointsRepo.findByUserIdAndAppId(userId, appId)
                .orElseGet(() -> PointsBalance.builder()
                        .userId(userId)
                        .app(app)
                        .balance(0)
                        .lifetimeEarned(0)
                        .build());

        bal.setBalance(bal.getBalance() + points);
        bal.setLifetimeEarned(bal.getLifetimeEarned() + points);
        pointsRepo.save(bal);

        log.info("[AI] +{} pts awarded to user='{}' — {}", points, userId, reason);
    }

    private void logAction(Long appId, String userId, String segment,
                           String actionType, Map<String, Object> payload) {
        actionLogRepo.save(AiActionLog.builder()
                .appId(appId)
                .userId(userId)
                .segment(segment)
                .actionType(actionType)
                .actionPayload(payload)
                .firedAt(LocalDateTime.now())
                .build());
    }
}