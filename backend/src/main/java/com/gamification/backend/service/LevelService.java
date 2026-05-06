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

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class LevelService {

    private final LevelConfigRepository      levelConfigRepo;
    private final UserLevelRepository         userLevelRepo;
    private final PointsRepository            pointsRepo;
    private final PointsTransactionRepository txRepo;
    private final UserBadgeRepository         userBadgeRepo;
    private final ObjectMapper                objectMapper;

    // ─────────────────────────────────────────────────────────────────────────
    // Called from RuleEngineService after points have been awarded
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public List<RewardResponse> onPointsEarned(IncomingEvent event, int pointsJustEarned) {
        List<RewardResponse> rewards = new ArrayList<>();
        if (pointsJustEarned <= 0) return rewards;

        List<LevelConfig> configs =
                levelConfigRepo.findByAppIdAndActiveTrue(event.getApp().getId());

        for (LevelConfig config : configs) {

            UserLevel userLevel = userLevelRepo
                    .findByUserIdAndLevelConfigId(event.getUserId(), config.getId())
                    .orElseGet(() -> UserLevel.builder()
                            .userId(event.getUserId())
                            .appId(event.getApp().getId())
                            .levelConfig(config)
                            .currentLevel(1)
                            .currentXp(0)
                            .totalXp(0)
                            .awardedLevelsJson("[]")
                            .build());

            int maxLevel = config.getMaxLevel() != null ? config.getMaxLevel() : 100;
            if (userLevel.getCurrentLevel() >= maxLevel) continue;

            // Add XP
            userLevel.setTotalXp(userLevel.getTotalXp() + pointsJustEarned);
            userLevel.setCurrentXp(userLevel.getCurrentXp() + pointsJustEarned);

            List<Integer> awardedLevels = parseIntList(userLevel.getAwardedLevelsJson());

            // Check for level ups (can level up multiple times if big XP gain)
            boolean didLevelUp = false;
            while (userLevel.getCurrentLevel() < maxLevel) {
                int threshold = getThreshold(config, userLevel.getCurrentLevel());
                if (userLevel.getCurrentXp() < threshold) break;

                // Level up!
                userLevel.setCurrentXp(userLevel.getCurrentXp() - threshold);
                userLevel.setCurrentLevel(userLevel.getCurrentLevel() + 1);
                didLevelUp = true;

                int newLevel = userLevel.getCurrentLevel();
                String title = getTitle(config.getLevelTitlesJson(), newLevel);

                // Head-start: pre-fill the progress bar
                int headStart = config.getHeadStartPct() != null ? config.getHeadStartPct() : 15;
                if (headStart > 0 && userLevel.getCurrentXp() == 0) {
                    int nextThreshold = getThreshold(config, newLevel);
                    int headStartXp = (int) Math.round(nextThreshold * headStart / 100.0);
                    userLevel.setCurrentXp(headStartXp);
                }

                // Level rewards
                if (!awardedLevels.contains(newLevel)) {
                    awardedLevels.add(newLevel);
                    List<RewardResponse> levelRewards =
                            applyLevelRewards(event, config.getLevelRewardsJson(), newLevel);
                    rewards.addAll(levelRewards);
                }

                rewards.add(RewardResponse.builder()
                        .type("LEVEL_UP")
                        .data(Map.of(
                                "levelConfigId", config.getId(),
                                "levelName",     config.getName(),
                                "newLevel",      newLevel,
                                "title",         title,
                                "currentXp",     userLevel.getCurrentXp(),
                                "nextThreshold", getThreshold(config, newLevel)
                        ))
                        .message("🎖️ Level up! You reached level " + newLevel
                                + (title.isEmpty() ? "" : " — " + title))
                        .build());

                log.info("Level up user={} config={} level={}", event.getUserId(),
                        config.getName(), newLevel);
            }

            // Always emit a LEVEL_UPDATE so the Flutter widget refreshes
            int nextThreshold = getThreshold(config, userLevel.getCurrentLevel());
            String title = getTitle(config.getLevelTitlesJson(), userLevel.getCurrentLevel());

            rewards.add(RewardResponse.builder()
                    .type("LEVEL_UPDATE")
                    .data(Map.of(
                            "levelConfigId", config.getId(),
                            "levelName",     config.getName(),
                            "currentLevel",  userLevel.getCurrentLevel(),
                            "currentXp",     userLevel.getCurrentXp(),
                            "nextThreshold", nextThreshold,
                            "totalXp",       userLevel.getTotalXp(),
                            "title",         title,
                            "progressPct",   nextThreshold > 0
                                    ? (int) (userLevel.getCurrentXp() * 100.0 / nextThreshold)
                                    : 100
                    ))
                    .message(didLevelUp
                            ? "You leveled up to level " + userLevel.getCurrentLevel() + "!"
                            : "XP updated")
                    .build());

            userLevel.setAwardedLevelsJson(toJson(awardedLevels));
            userLevelRepo.save(userLevel);
        }

        return rewards;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public query
    // ─────────────────────────────────────────────────────────────────────────

    public List<UserLevel> getUserLevels(String userId, Long appId) {
        return userLevelRepo.findByUserIdAndAppId(userId, appId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    /** XP needed to advance from the given level to level+1 */
    private int getThreshold(LevelConfig config, int currentLevel) {
        if (config.getThresholdType() == LevelConfig.ThresholdType.FLAT) {
            return config.getFlatThreshold() != null ? config.getFlatThreshold() : 1000;
        }
        // CUSTOM — index 0 = threshold to reach level 2, etc.
        List<Integer> thresholds = parseIntList(config.getCustomThresholdsJson());
        int idx = currentLevel - 1; // level 1 → index 0
        if (idx < thresholds.size()) return thresholds.get(idx);
        // Beyond defined thresholds — use last one or flat fallback
        return thresholds.isEmpty() ? 1000 : thresholds.get(thresholds.size() - 1);
    }

    private String getTitle(String titlesJson, int level) {
        List<String> titles = parseStringList(titlesJson);
        if (titles.isEmpty()) return "";
        int idx = level - 1;
        return idx < titles.size() ? titles.get(idx) : titles.get(titles.size() - 1);
    }

    @SuppressWarnings("unchecked")
    private List<RewardResponse> applyLevelRewards(IncomingEvent event,
                                                    String rewardsJson, int level) {
        List<RewardResponse> result = new ArrayList<>();
        List<Map<String, Object>> rewardDefs;
        try {
            rewardDefs = objectMapper.readValue(rewardsJson,
                    new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return result;
        }

        for (Map<String, Object> def : rewardDefs) {
            Object lvlObj = def.get("level");
            if (lvlObj == null || ((Number) lvlObj).intValue() != level) continue;

            // Points
            Object pts = def.get("points");
            if (pts != null && ((Number) pts).intValue() > 0) {
                int amount = ((Number) pts).intValue();
                PointsBalance balance = pointsRepo
                        .findByUserIdAndAppId(event.getUserId(), event.getApp().getId())
                        .orElseGet(() -> PointsBalance.builder()
                                .userId(event.getUserId())
                                .app(event.getApp())
                                .balance(0).lifetimeEarned(0).build());
                int newBal = balance.getBalance() + amount;
                balance.setBalance(newBal);
                balance.setLifetimeEarned(balance.getLifetimeEarned() + amount);
                pointsRepo.save(balance);
                txRepo.save(PointsTransaction.builder()
                        .userId(event.getUserId()).app(event.getApp())
                        .amount(amount).type("EARN")
                        .reason("Level " + level + " reward")
                        .balanceAfter(newBal).build());
                result.add(RewardResponse.builder()
                        .type("POINTS")
                        .data(Map.of("amount", amount, "newBalance", newBal))
                        .message("+" + amount + " pts for reaching level " + level + "!")
                        .build());
            }

            // Badge
            Object badgeIdObj = def.get("badgeId");
            if (badgeIdObj != null) {
                long bid = ((Number) badgeIdObj).longValue();
                if (!userBadgeRepo.existsByUserIdAndBadgeId(event.getUserId(), bid)) {
                    userBadgeRepo.save(UserBadge.builder()
                            .userId(event.getUserId()).badgeId(bid).build());
                    result.add(RewardResponse.builder()
                            .type("BADGE")
                            .data(Map.of("badgeId", bid))
                            .message("Level " + level + " badge unlocked! 🏅")
                            .build());
                }
            }
        }
        return result;
    }

    private List<Integer> parseIntList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try { return objectMapper.readValue(json, new TypeReference<List<Integer>>() {}); }
        catch (Exception e) { return new ArrayList<>(); }
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return objectMapper.readValue(json, new TypeReference<List<String>>() {}); }
        catch (Exception e) { return List.of(); }
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return "[]"; }
    }
}