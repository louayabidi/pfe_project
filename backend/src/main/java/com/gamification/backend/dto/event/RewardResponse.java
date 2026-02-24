package com.gamification.backend.dto.event;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RewardResponse {
    private String type; // "BADGE" ou "POINTS"
    private Object data;
    private String message;
}