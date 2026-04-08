package com.gamification.backend.controller;

import com.gamification.backend.dto.analytics.AnalyticsOverviewDTO;
import com.gamification.backend.service.AnalyticsService;

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
   
  

    /**
     * Get analytics overview for an app
     * 
     * @param token JWT token with "Bearer " prefix
     * @param appId Application ID
     * @param days Number of days to analyze (1-365, default 30)
     * @return AnalyticsOverviewDTO with KPIs and charts data
     */
  @GetMapping("/overview/{appId}")
public ResponseEntity<AnalyticsOverviewDTO> getOverview(
    @PathVariable Long appId,
    @RequestParam(defaultValue = "30") int days
) {
    AnalyticsOverviewDTO result = analyticsService.getOverview(appId, days);
    
    // Temporary debug log
    log.info("eventsByDay size: {}", 
        result.getEventsByDay() != null ? result.getEventsByDay().size() : "NULL");
    log.info("eventsByDay content: {}", result.getEventsByDay());
    
    return ResponseEntity.ok(result);
}
  
}