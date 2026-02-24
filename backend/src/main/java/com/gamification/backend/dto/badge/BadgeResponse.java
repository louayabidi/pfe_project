package com.gamification.backend.dto.badge;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BadgeResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Boolean hidden;
    private Integer maxAwardsPerUser;
    private LocalDateTime createdAt;
}