package com.gamification.backend.dto.rule;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class RuleResponse {
    private Long id;
    private String name;
    private String description;
    private String triggerEvent;
    private List<Map<String, Object>> conditions;
    private List<Map<String, Object>> actions;
    private Integer priority;
    private Boolean active;
    private LocalDateTime createdAt;
}