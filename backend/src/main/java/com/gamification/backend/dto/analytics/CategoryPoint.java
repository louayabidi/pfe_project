package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryPoint {
    private String label;  // Event name, user ID, or badge name
    private long value;    // Count
}