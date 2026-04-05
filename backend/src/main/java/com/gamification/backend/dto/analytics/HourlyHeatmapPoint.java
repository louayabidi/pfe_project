package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HourlyHeatmapPoint {
    private int dayOfWeek;  // 0 = Monday, 6 = Sunday
    private int hour;       // 0-23 (hour of day)
    private long count;     // Number of events at this time
}