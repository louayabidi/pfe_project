package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSeriesPoint {
    private String date;   // Format: YYYY-MM-DD
    private long value;    // Count of events or users
}