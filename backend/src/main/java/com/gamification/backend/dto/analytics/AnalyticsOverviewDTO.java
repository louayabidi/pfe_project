package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewDTO {
    
    // ── KPIs (Key Performance Indicators) ────────────────────────────────
    private long totalEvents;
    private long totalUsers;
    private long activeUsersLast7Days;
    private long activeUsersLast30Days;
    private double avgEventsPerUser;
    private long totalBadgesAwarded;
    private long totalPointsAwarded;
    
    // ── Time Series Data ────────────────────────────────────────────────
    private List<TimeSeriesPoint> eventsByDay;
    private List<TimeSeriesPoint> newUsersByDay;
    
    // ── Top Rankings ────────────────────────────────────────────────────
    private List<CategoryPoint> topEvents;
    private List<CategoryPoint> topUsers;
    private List<CategoryPoint> badgeDistribution;
    
    // ── Advanced Analytics ──────────────────────────────────────────────
    private List<RetentionRow> retentionMatrix;
    private List<HourlyHeatmapPoint> heatmap;
}