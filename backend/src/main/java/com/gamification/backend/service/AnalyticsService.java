package com.gamification.backend.service;

import com.gamification.backend.dto.analytics.*;
import com.gamification.backend.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepo;

    /**
     * Get complete analytics overview for an app
     * Results are cached for 5 minutes
     */
    @Cacheable(value = "analytics", key = "#appId + ':' + #days")
    public AnalyticsOverviewDTO getOverview(Long appId, int days) {
        log.info("📊 Fetching analytics for appId: {} with {} days", appId, days);
        
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        // Fetch all KPIs
        long totalEvents       = analyticsRepo.countTotalEvents(appId);
        long totalUsers        = analyticsRepo.countTotalUsers(appId);
        long active7Days       = analyticsRepo.countActiveUsersSince(appId, LocalDateTime.now().minusDays(7));
        long active30Days      = analyticsRepo.countActiveUsersSince(appId, LocalDateTime.now().minusDays(30));
        long totalBadges       = analyticsRepo.countTotalBadgesAwarded(appId);
        long totalPoints       = analyticsRepo.sumTotalPointsAwarded(appId);
        
        double avgEventsPerUser = totalUsers > 0 
            ? (double) totalEvents / totalUsers 
            : 0;

        return AnalyticsOverviewDTO.builder()
            .totalEvents(totalEvents)
            .totalUsers(totalUsers)
            .activeUsersLast7Days(active7Days)
            .activeUsersLast30Days(active30Days)
            .avgEventsPerUser(Math.round(avgEventsPerUser * 10.0) / 10.0)
            .totalBadgesAwarded(totalBadges)
            .totalPointsAwarded(totalPoints)
            // Time series
            .eventsByDay(toTimeSeries(analyticsRepo.findEventsByDay(appId, since)))
            .newUsersByDay(toTimeSeries(analyticsRepo.findNewUsersByDay(appId, since)))
            // Top rankings
            .topEvents(toCategoryList(analyticsRepo.findTopEvents(appId, since)))
            .topUsers(toCategoryList(analyticsRepo.findTopUsers(appId, since)))
            .badgeDistribution(toCategoryList(analyticsRepo.findBadgeDistribution(appId)))
            // Advanced
            .heatmap(toHeatmap(analyticsRepo.findHeatmap(appId, since)))
            .retentionMatrix(toRetention(analyticsRepo.findRetentionCohorts(appId)))
            .build();
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private List<TimeSeriesPoint> toTimeSeries(List<Object[]> rows) {
        List<TimeSeriesPoint> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new TimeSeriesPoint(
                (String) row[0],                      // date (YYYY-MM-DD)
                ((Number) row[1]).longValue()         // count
            ));
        }
        return result;
    }

    private List<CategoryPoint> toCategoryList(List<Object[]> rows) {
        List<CategoryPoint> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new CategoryPoint(
                (String) row[0],                      // label (event name, user ID, etc.)
                ((Number) row[1]).longValue()         // count
            ));
        }
        return result;
    }

    private List<HourlyHeatmapPoint> toHeatmap(List<Object[]> rows) {
        List<HourlyHeatmapPoint> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new HourlyHeatmapPoint(
                ((Number) row[0]).intValue(),         // day of week (0-6)
                ((Number) row[1]).intValue(),         // hour (0-23)
                ((Number) row[2]).longValue()         // count
            ));
        }
        return result;
    }

    private List<RetentionRow> toRetention(List<Object[]> rows) {
        // Group rows by cohort
        Map<String, Map<Integer, Long>> cohortMap = new LinkedHashMap<>();
        
        for (Object[] row : rows) {
            String cohort  = (String) row[0];
            int weekNum    = ((Number) row[1]).intValue();
            long users     = ((Number) row[2]).longValue();
            
            cohortMap.computeIfAbsent(cohort, k -> new TreeMap<>()).put(weekNum, users);
        }

        // Convert to retention rates
        List<RetentionRow> result = new ArrayList<>();
        for (Map.Entry<String, Map<Integer, Long>> entry : cohortMap.entrySet()) {
            Map<Integer, Long> weeks = entry.getValue();
            long week0Users = weeks.getOrDefault(0, 1L); // Initial cohort size
            
            List<Double> rates = new ArrayList<>();
            for (int w = 0; w <= 8; w++) {
                long count = weeks.getOrDefault(w, 0L);
                double retention = week0Users > 0 
                    ? (count * 100.0 / week0Users) 
                    : 0;
                rates.add(Math.round(retention * 10.0) / 10.0);
            }
            
            result.add(new RetentionRow(entry.getKey(), rates));
        }
        
        return result;
    }
}