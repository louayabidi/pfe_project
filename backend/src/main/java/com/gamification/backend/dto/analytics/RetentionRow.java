package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RetentionRow {
    private String cohort;          // Format: YYYY-MM-DD (cohort start date)
    private List<Double> rates;     // Retention percentage for each week (week 0, 1, 2, ..., 8)
}