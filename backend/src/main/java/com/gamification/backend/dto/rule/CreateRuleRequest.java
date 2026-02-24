package com.gamification.backend.dto.rule;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CreateRuleRequest {
    
    @NotBlank(message = "Le nom de la règle est obligatoire")
    private String name;
    
    private String description;
    
    @NotBlank(message = "L'événement déclencheur est obligatoire")
    private String triggerEvent;
    
    private List<ConditionDto> conditions;
    
    @NotNull(message = "Les actions sont obligatoires")
    private List<ActionDto> actions;
    
    private Integer priority = 0;
    private Integer cooldownMinutes;
    private Integer maxAwardsPerUser;
    
    @Data
    public static class ConditionDto {
        private String field;
        private String operator;
        private Object value;
        private String valueType;
    }
    
    @Data
    public static class ActionDto {
        private String type; // "BADGE" ou "POINTS"
        private Long badgeId; // pour type = "BADGE"
        private Integer pointsAmount; // pour type = "POINTS"
        private Map<String, Object> params;
    }
}