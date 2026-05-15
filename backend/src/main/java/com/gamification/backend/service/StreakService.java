package com.gamification.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gamification.backend.dto.event.RewardResponse;
import com.gamification.backend.model.*;
import com.gamification.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreakService {

    private final StreakConfigRepository streakConfigRepo;
    private final UserStreakRepository userStreakRepo;
    private final PointsRepository pointsRepo;
    private final PointsTransactionRepository txRepo;
    private final UserBadgeRepository userBadgeRepo;
    private final ObjectMapper objectMapper;

    /**
     * Main entry point — called from RuleEngineService after rule rewards.
     * Evaluates all active streaks for the given event and returns rewards.
     */
    @Transactional
    public List<RewardResponse> evaluateStreak(IncomingEvent event) {
        List<RewardResponse> rewards = new ArrayList<>();

        // Load all active streak configs for this app
        List<StreakConfig> configs =
                streakConfigRepo.findByAppIdAndActiveTrue(event.getApp().getId());

        for (StreakConfig config : configs) {

            // ── 1. Check if this event qualifies ──────────────────────────
            List<String> qualifying = parseStringList(config.getQualifyingEventsJson());
            if (!qualifying.isEmpty() && !qualifying.contains(event.getEventName())) {
                continue;  // This event doesn't trigger this streak
            }

            // ── 2. Load or create the user's streak record ────────────────
            UserStreak streak = userStreakRepo
                    .findByUserIdAndStreakConfigId(event.getUserId(), config.getId())
                    .orElseGet(() -> UserStreak.builder()
                            .userId(event.getUserId())
                            .appId(event.getApp().getId())
                            .streakConfig(config)
                            .currentStreak(0)
                            .longestStreak(0)
                            .freezeTokens(0)
                            .awardedMilestonesJson("[]")
                            .build());

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime last = streak.getLastActivityAt();

            boolean alreadyActive = false;
            boolean streakBroken = false;

            // ── 3. Determine streak progression ───────────────────────────
            if (last == null) {
                // First ever activity — start streak at 1
                streak.setCurrentStreak(1);

            } else if (config.getWindowType() == StreakConfig.WindowType.CALENDAR_DAY) {
                // ── CALENDAR_DAY logic ──
                LocalDate lastDate = last.toLocalDate();
                LocalDate today = now.toLocalDate();
                long daysBetween = ChronoUnit.DAYS.between(lastDate, today);

                if (daysBetween == 0) {
                    // Already counted today
                    alreadyActive = true;

                } else if (daysBetween == 1) {
                    // Consecutive day — increment streak
                    streak.setCurrentStreak(streak.getCurrentStreak() + 1);

                } else {
                    // Missed at least one day — try to save the streak

                    int graceHours = config.getGraceHours() != null 
                        ? config.getGraceHours() : 0;
                    
                    // Hours into the day after the missed day
                    long hoursIntoToday = ChronoUnit.HOURS.between(
                            lastDate.plusDays(1).atStartOfDay(), now);

                    boolean savedByGrace = graceHours > 0 
                        && daysBetween == 2 
                        && hoursIntoToday <= graceHours;
                    
                    boolean savedByFreeze = !savedByGrace
                        && daysBetween == 2
                        && streak.getFreezeTokens() > 0;

                    if (savedByGrace) {
                        // Grace period saved the streak
                        streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                        log.info("Streak saved by grace for user={} config={}",
                                event.getUserId(), config.getName());

                    } else if (savedByFreeze) {
                        // Freeze token saved the streak
                        streak.setFreezeTokens(streak.getFreezeTokens() - 1);
                        streak.setCurrentStreak(streak.getCurrentStreak() + 1);
                        rewards.add(RewardResponse.builder()
                                .type("STREAK_FREEZE_USED")
                                .data(Map.of(
                                        "streakConfigId", config.getId(),
                                        "remainingTokens", streak.getFreezeTokens()))
                                .message("❄️ Freeze token used — streak saved!")
                                .build());
                        log.info("Streak saved by freeze token for user={} config={}",
                                event.getUserId(), config.getName());

                    } else {
                        // Streak broken :(
                        streakBroken = true;
                        int previous = streak.getCurrentStreak();
                        streak.setCurrentStreak(1);
                        streak.setAwardedMilestonesJson("[]");

                        // Check if comeback bonus applies
                        if (config.getComebackAfterDays() != null
                                && daysBetween >= config.getComebackAfterDays()
                                && config.getComebackBonusPoints() != null
                                && config.getComebackBonusPoints() > 0) {
                            addPoints(event, config.getComebackBonusPoints(),
                                    "🎉 Welcome back! Comeback bonus", rewards, 
                                    config.getName());
                        }

                        log.info("Streak broken for user={} config={} previous={}",
                                event.getUserId(), config.getName(), previous);
                    }
                }

            } else {
                // ── ROLLING_24H logic ──
                long hoursElapsed = ChronoUnit.HOURS.between(last, now);

                if (hoursElapsed < 24) {
                    alreadyActive = true;  // Already counted in window

                } else if (hoursElapsed <= 48) {
                    // Within grace window — continue streak
                    streak.setCurrentStreak(streak.getCurrentStreak() + 1);

                } else {
                    // Streak broken
                    streakBroken = true;
                    streak.setCurrentStreak(1);
                    streak.setAwardedMilestonesJson("[]");
                }
            }

            // Skip if we already counted this action today
            if (alreadyActive) continue;

            // Update last activity time and longest streak
            streak.setLastActivityAt(now);
            if (streak.getCurrentStreak() > streak.getLongestStreak()) {
                streak.setLongestStreak(streak.getCurrentStreak());
            }

            // ── 4. Award Milestone Rewards ───────────────────────────────
            if (!streakBroken) {
                List<Map<String, Object>> milestones = parseMilestones(
                    config.getMilestonesJson());
                List<Integer> awardedDays = parseIntList(
                    streak.getAwardedMilestonesJson());

                for (Map<String, Object> m : milestones) {
                    int targetDay = ((Number) m.get("day")).intValue();
                    
                    if (streak.getCurrentStreak() >= targetDay 
                            && !awardedDays.contains(targetDay)) {
                        awardedDays.add(targetDay);

                        // Points milestone
                        Object pts = m.get("points");
                        if (pts != null && ((Number) pts).intValue() > 0) {
                            addPoints(event, ((Number) pts).intValue(),
                                    "🔥 " + targetDay + "-day streak!", 
                                    rewards, config.getName());
                        }

                        // Badge milestone
                        Object badgeIdObj = m.get("badgeId");
                        if (badgeIdObj != null) {
                            long bid = ((Number) badgeIdObj).longValue();
                            if (!userBadgeRepo.existsByUserIdAndBadgeId(
                                    event.getUserId(), bid)) {
                                userBadgeRepo.save(UserBadge.builder()
                                        .userId(event.getUserId())
                                        .badgeId(bid)
                                        .build());
                                rewards.add(RewardResponse.builder()
                                        .type("BADGE")
                                        .data(Map.of("badgeId", bid))
                                        .message("Streak badge unlocked! 🏅")
                                        .build());
                            }
                        }

                        // Freeze token milestone
                        Boolean giveFreeze = (Boolean) m.getOrDefault(
                            "freezeToken", false);
                        if (Boolean.TRUE.equals(giveFreeze)) {
                            int max = config.getMaxFreezeTokens() != null 
                                ? config.getMaxFreezeTokens() : 1;
                            if (streak.getFreezeTokens() < max) {
                                streak.setFreezeTokens(
                                    streak.getFreezeTokens() + 1);
                                rewards.add(RewardResponse.builder()
                                        .type("FREEZE_TOKEN")
                                        .data(Map.of(
                                            "totalTokens", 
                                            streak.getFreezeTokens()))
                                        .message("❄️ Freeze token earned!")
                                        .build());
                            }
                        }

                        log.info(
                            "Milestone awarded user={} config={} day={}",
                            event.getUserId(), config.getName(), targetDay);
                    }
                }
                streak.setAwardedMilestonesJson(toJson(awardedDays));
            }

            // ── 5. Always emit STREAK_UPDATE for widget refresh ──────────
            double multiplier = resolveMultiplier(
                config.getMultipliersJson(),
                streak.getCurrentStreak());

            rewards.add(RewardResponse.builder()
                    .type("STREAK_UPDATE")
                    .data(Map.of(
                            "streakConfigId", config.getId(),
                            "streakName", config.getName(),
                            "currentStreak", streak.getCurrentStreak(),
                            "longestStreak", streak.getLongestStreak(),
                            "freezeTokens", streak.getFreezeTokens(),
                            "multiplier", multiplier,
                            "streakBroken", streakBroken
                    ))
                    .message(streakBroken
                            ? "Streak reset 💔 — start fresh!"
                            : "🔥 " + streak.getCurrentStreak() + " day streak!")
                    .build());

            // Save updated streak
            userStreakRepo.save(streak);
        }

        return rewards;
    }

    /**
     * Query endpoint for SDK: get user's current streaks
     */
    public List<UserStreak> getUserStreaks(String userId, Long appId) {
        return userStreakRepo.findByUserIdAndAppId(userId, appId);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────────────

    private void addPoints(IncomingEvent event, int amount, String reason,
                           List<RewardResponse> rewards, String streakName) {
        PointsBalance balance = pointsRepo
                .findByUserIdAndAppId(event.getUserId(), event.getApp().getId())
                .orElseGet(() -> PointsBalance.builder()
                        .userId(event.getUserId())
                        .app(event.getApp())
                        .balance(0)
                        .lifetimeEarned(0)
                        .build());

        int newBalance = balance.getBalance() + amount;
        balance.setBalance(newBalance);
        balance.setLifetimeEarned(balance.getLifetimeEarned() + amount);
        pointsRepo.save(balance);

        txRepo.save(PointsTransaction.builder()
                .userId(event.getUserId())
                .app(event.getApp())
                .amount(amount)
                .type("EARN")
                .reason("Streak [" + streakName + "]: " + reason)
                .balanceAfter(newBalance)
                .build());

        rewards.add(RewardResponse.builder()
                .type("POINTS")
                .data(Map.of("amount", amount, "newBalance", newBalance))
                .message("+" + amount + " points " + reason)
                .build());
    }

    private double resolveMultiplier(String multipliersJson, int currentStreak) {
        List<Map<String, Object>> tiers = parseMilestones(multipliersJson);
        double multiplier = 1.0;
        for (Map<String, Object> tier : tiers) {
            int fromDay = ((Number) tier.get("fromDay")).intValue();
            if (currentStreak >= fromDay) {
                multiplier = ((Number) tier.get("multiplier")).doubleValue();
            }
        }
        return multiplier;
    }

    @SuppressWarnings("unchecked")
    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Integer> parseIntList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, 
                new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseMilestones(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, 
                new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }
}