package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardOverviewDTO {
    private Long appId;
    private Long totalEvents;
    private Long totalSuccessful;
    private Long totalFailed;
    private Double globalSuccessRate;
    private Map<String, EventStatisticsDTO> eventStats;
}