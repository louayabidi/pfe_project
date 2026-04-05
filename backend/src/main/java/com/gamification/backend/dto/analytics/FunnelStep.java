package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FunnelStep {
    private String step;
    private long   users;
    private double dropOff;
}