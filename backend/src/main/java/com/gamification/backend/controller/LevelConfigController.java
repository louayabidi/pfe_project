package com.gamification.backend.controller;

import com.gamification.backend.model.*;
import com.gamification.backend.repository.*;
import com.gamification.backend.service.LevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/levels")
@RequiredArgsConstructor
public class LevelConfigController {

    private final LevelConfigRepository levelConfigRepo;
    private final AppRepository         appRepo;
    private final LevelService          levelService;

    // ── Dashboard CRUD ────────────────────────────────────────────────────────

    @GetMapping("/config/{appId}")
    public ResponseEntity<List<LevelConfig>> list(@PathVariable Long appId) {
        return ResponseEntity.ok(levelConfigRepo.findByAppId(appId));
    }

    @PostMapping("/config/{appId}")
    public ResponseEntity<LevelConfig> create(@PathVariable Long appId,
                                              @RequestBody LevelConfig req) {
        App app = appRepo.findById(appId)
                .orElseThrow(() -> new RuntimeException("App not found"));
        req.setId(null);
        req.setApp(app);
        if (req.getActive() == null) req.setActive(true);
        return ResponseEntity.ok(levelConfigRepo.save(req));
    }

    @PutMapping("/config/{id}")
    public ResponseEntity<LevelConfig> update(@PathVariable Long id,
                                              @RequestBody LevelConfig req) {
        LevelConfig existing = levelConfigRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Level config not found"));
        existing.setName(req.getName());
        existing.setThresholdType(req.getThresholdType());
        existing.setFlatThreshold(req.getFlatThreshold());
        existing.setCustomThresholdsJson(req.getCustomThresholdsJson());
        existing.setHeadStartPct(req.getHeadStartPct());
        existing.setLevelTitlesJson(req.getLevelTitlesJson());
        existing.setLevelRewardsJson(req.getLevelRewardsJson());
        existing.setMaxLevel(req.getMaxLevel());
        existing.setActive(req.getActive());
        return ResponseEntity.ok(levelConfigRepo.save(existing));
    }

    @DeleteMapping("/config/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        levelConfigRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/config/{id}/toggle")
    public ResponseEntity<LevelConfig> toggle(@PathVariable Long id) {
        LevelConfig cfg = levelConfigRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        cfg.setActive(!Boolean.TRUE.equals(cfg.getActive()));
        return ResponseEntity.ok(levelConfigRepo.save(cfg));
    }

    // ── SDK: get user level ───────────────────────────────────────────────────

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserLevels(
            @PathVariable String userId,
            @RequestParam Long appId) {

        List<UserLevel> levels = levelService.getUserLevels(userId, appId);
        List<LevelConfig> configs = levelConfigRepo.findByAppIdAndActiveTrue(appId);

        List<Map<String, Object>> result = new ArrayList<>();

        for (LevelConfig config : configs) {
            Optional<UserLevel> ul = levels.stream()
                    .filter(l -> l.getLevelConfig().getId().equals(config.getId()))
                    .findFirst();

            int currentLevel = ul.map(UserLevel::getCurrentLevel).orElse(1);
            int currentXp    = ul.map(UserLevel::getCurrentXp).orElse(0);
            int totalXp      = ul.map(UserLevel::getTotalXp).orElse(0);

            // Calculate next threshold for display
            int nextThreshold = config.getThresholdType() == LevelConfig.ThresholdType.FLAT
                    ? (config.getFlatThreshold() != null ? config.getFlatThreshold() : 1000)
                    : currentLevel; // simplified — frontend should recalculate

            Map<String, Object> dto = new HashMap<>();
            dto.put("levelConfigId",  config.getId());
            dto.put("levelName",      config.getName());
            dto.put("currentLevel",   currentLevel);
            dto.put("currentXp",      currentXp);
            dto.put("nextThreshold",  nextThreshold);
            dto.put("totalXp",        totalXp);
            dto.put("headStartPct",   config.getHeadStartPct());
            dto.put("levelTitlesJson", config.getLevelTitlesJson());
            dto.put("maxLevel",       config.getMaxLevel());
            dto.put("progressPct",    nextThreshold > 0
                    ? (int) (currentXp * 100.0 / nextThreshold) : 100);
            result.add(dto);
        }

        return ResponseEntity.ok(result);
    }
}