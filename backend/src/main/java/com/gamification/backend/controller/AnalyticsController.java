package com.gamification.backend.controller;

import com.gamification.backend.dto.analytics.AnalyticsOverviewDTO;
import com.gamification.backend.service.AnalyticsService;
import com.gamification.backend.service.AppService;
import com.gamification.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AppService appService;
    private final JwtService jwtService;

    /**
     * Get analytics overview for an app
     * 
     * @param token JWT token with "Bearer " prefix
     * @param appId Application ID
     * @param days Number of days to analyze (1-365, default 30)
     * @return AnalyticsOverviewDTO with KPIs and charts data
     */
    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewDTO> getOverview(
            @RequestHeader("Authorization") String token,
            @RequestParam Long appId,
            @RequestParam(defaultValue = "30") int days) {

        log.info("📊 Analytics request: appId={}, days={}", appId, days);

        // 1. Extract email from JWT token
        String email = extractEmail(token);

        // 2. Verify app ownership (security check)
        appService.verifyOwnership(email, appId);

        // 3. Validate and cap days parameter
        int safeDays = Math.min(Math.max(days, 1), 365);

        // 4. Get analytics and return
        AnalyticsOverviewDTO overview = analyticsService.getOverview(appId, safeDays);
        
        log.info("✅ Analytics retrieved: {} events, {} users", 
                 overview.getTotalEvents(), overview.getTotalUsers());
        
        return ResponseEntity.ok(overview);
    }

    /**
     * Extract email from JWT token
     */
    private String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            String jwtToken = token.substring(7);
            return jwtService.extractEmail(jwtToken);
        }
        log.error("❌ Invalid token format");
        throw new RuntimeException("Token invalide - format Bearer required");
    }
}