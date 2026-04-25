package com.gamification.backend.controller;

import com.gamification.backend.repository.AiActionLogRepository;
import com.gamification.backend.repository.AnalyticsRepository;
import com.gamification.backend.service.AiEngineService;
import com.gamification.backend.service.AppService;
import com.gamification.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiEngineController {

    private final AiEngineService       aiEngineService;
    private final AiActionLogRepository actionLogRepo;
    private final AnalyticsRepository   analyticsRepo;
    private final AppService            appService;
    private final JwtService            jwtService;

    private String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return jwtService.extractEmail(token.substring(7));
        }
        throw new RuntimeException("Token invalide");
    }

    // Manually trigger the engine for one app
    @PostMapping("/run/{appId}")
    public ResponseEntity<Map<String, Object>> runEngine(
            @RequestHeader("Authorization") String token,
            @PathVariable Long appId) {

        appService.verifyOwnership(extractEmail(token), appId);
        aiEngineService.runEngineForApp(appId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "completed");
        response.put("appId", appId);
        return ResponseEntity.ok(response);
    }

    // Manually trigger outcome scoring
    @PostMapping("/score-outcomes")
    public ResponseEntity<Map<String, Object>> scoreOutcomes(
            @RequestHeader("Authorization") String token) {

        // Any valid JWT is enough — this is an internal op
        extractEmail(token);
        aiEngineService.scoreOutcomes();

        Map<String, Object> response = new HashMap<>();
        response.put("status", "scored");
        return ResponseEntity.ok(response);
    }

    // Get segment breakdown for an app
    @GetMapping("/segments/{appId}")
    public ResponseEntity<List<Map<String, Object>>> getSegments(
            @RequestHeader("Authorization") String token,
            @PathVariable Long appId) {

        appService.verifyOwnership(extractEmail(token), appId);

        List<Object[]> rows = analyticsRepo.findUserSegments(appId);
        List<Map<String, Object>> result = rows.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("userId",        row[0]);
            m.put("appId",         row[1]);
            m.put("lifetimePoints",row[2]);
            m.put("totalEvents",   row[3]);
            m.put("activeDays",    row[4]);
            m.put("lastSeen",      row[5]);
            m.put("daysSilent",    row[6]);
            m.put("segment",       row[7]);
            return m;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // Get action stats (what worked)
    @GetMapping("/stats/{appId}")
    public ResponseEntity<List<Map<String, Object>>> getStats(
            @RequestHeader("Authorization") String token,
            @PathVariable Long appId) {

        appService.verifyOwnership(extractEmail(token), appId);

        List<Object[]> rows = actionLogRepo.findSegmentStats(appId);
        List<Map<String, Object>> result = rows.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("segment",    row[0]);
            m.put("actionType", row[1]);
            m.put("total",      row[2]);
            m.put("returned",   row[3]);
            m.put("returnRate", row[4]);
            return m;
        }).toList();

        return ResponseEntity.ok(result);
    }
}