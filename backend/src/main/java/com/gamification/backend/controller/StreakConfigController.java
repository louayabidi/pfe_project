package com.gamification.backend.controller;

import com.gamification.backend.model.*;
import com.gamification.backend.repository.*;
import com.gamification.backend.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/streaks")
@RequiredArgsConstructor
public class StreakConfigController {

    private final StreakConfigRepository streakConfigRepo;
    private final AppRepository appRepo;
    private final UserStreakRepository userStreakRepo;
    private final StreakService streakService;

    // ── Dashboard: CRUD Endpoints ─────────────────────────────────────

    /**
     * GET /api/streaks/config/{appId}
     * List all streak configs for an app
     */
    @GetMapping("/config/{appId}")
    public ResponseEntity<List<StreakConfig>> list(@PathVariable Long appId) {
        return ResponseEntity.ok(streakConfigRepo.findByAppId(appId));
    }

    /**
     * POST /api/streaks/config/{appId}
     * Create a new streak config
     */
    @PostMapping("/config/{appId}")
    public ResponseEntity<StreakConfig> create(@PathVariable Long appId,
                                               @RequestBody StreakConfig req) {
        App app = appRepo.findById(appId)
                .orElseThrow(() -> new RuntimeException("App not found"));
        req.setId(null);
        req.setApp(app);
        if (req.getActive() == null) req.setActive(true);
        return ResponseEntity.ok(streakConfigRepo.save(req));
    }

    /**
     * PUT /api/streaks/config/{id}
     * Update a streak config
     */
    @PutMapping("/config/{id}")
    public ResponseEntity<StreakConfig> update(@PathVariable Long id,
                                               @RequestBody StreakConfig req) {
        StreakConfig existing = streakConfigRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Streak config not found"));
        existing.setName(req.getName());
        existing.setQualifyingEventsJson(req.getQualifyingEventsJson());
        existing.setWindowType(req.getWindowType());
        existing.setGraceHours(req.getGraceHours());
        existing.setMaxFreezeTokens(req.getMaxFreezeTokens());
        existing.setMilestonesJson(req.getMilestonesJson());
        existing.setMultipliersJson(req.getMultipliersJson());
        existing.setComebackAfterDays(req.getComebackAfterDays());
        existing.setComebackBonusPoints(req.getComebackBonusPoints());
        existing.setActive(req.getActive());
        return ResponseEntity.ok(streakConfigRepo.save(existing));
    }

    /**
     * DELETE /api/streaks/config/{id}
     * Delete a streak config
     */
    @DeleteMapping("/config/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        streakConfigRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/streaks/config/{id}/toggle
     * Toggle a streak config active/inactive
     */
    @PatchMapping("/config/{id}/toggle")
    public ResponseEntity<StreakConfig> toggle(@PathVariable Long id) {
        StreakConfig cfg = streakConfigRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        cfg.setActive(!Boolean.TRUE.equals(cfg.getActive()));
        return ResponseEntity.ok(streakConfigRepo.save(cfg));
    }

    // ── SDK: Get User Streaks ─────────────────────────────────────────

    /**
     * GET /api/streaks/user/{userId}
     * Get user's current streaks (SDK endpoint)
     * 
     * @header X-API-Key: Your app's API key
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserStreaks(
            @PathVariable String userId,
            @RequestHeader("X-API-Key") String apiKey) {

        App app = appRepo.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("Invalid API key"));
        Long appId = app.getId();

        List<UserStreak> streaks = streakService.getUserStreaks(userId, appId);
        List<StreakConfig> configs = streakConfigRepo
            .findByAppIdAndActiveTrue(appId);

        List<Map<String, Object>> result = new ArrayList<>();

        for (StreakConfig config : configs) {
            Optional<UserStreak> us = streaks.stream()
                    .filter(s -> s.getStreakConfig().getId()
                        .equals(config.getId()))
                    .findFirst();

            Map<String, Object> dto = new HashMap<>();
            dto.put("streakConfigId", config.getId());
            dto.put("streakName", config.getName());
            dto.put("windowType", config.getWindowType().name());
            dto.put("maxFreezeTokens", config.getMaxFreezeTokens());
            dto.put("currentStreak", us.map(UserStreak::getCurrentStreak)
                .orElse(0));
            dto.put("longestStreak", us.map(UserStreak::getLongestStreak)
                .orElse(0));
            dto.put("freezeTokens", us.map(UserStreak::getFreezeTokens)
                .orElse(0));
            dto.put("lastActivityAt", us.map(s -> s.getLastActivityAt() != null
                    ? s.getLastActivityAt().toString() : null).orElse(null));
            result.add(dto);
        }

        return ResponseEntity.ok(result);
    }
}