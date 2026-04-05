package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventStatisticsDTO {
    private String eventName;
    private Long total;
    private Long successful;
    private Long failed;
    private Double successRate;
}