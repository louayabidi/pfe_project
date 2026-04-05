package com.gamification.backend.dto.points_transaction;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PointsResponse {
    private String userId;
    private Integer balance;
    private Integer lifetimeEarned;
}