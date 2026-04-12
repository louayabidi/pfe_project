package com.gamification.backend.dto.rule;
 
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
 
@Data
@Builder
public class AdvancedRuleResponse {
    private Long              id;
    private String            name;
    private String            description;
    private String            triggerEvent;
    private String            conditionLogic;
    private List<Map<String,Object>> conditions;
    private List<Map<String,Object>> actions;
    private Integer           priority;
    private Boolean           active;
    private Integer           cooldownMinutes;
    private Integer           maxAwardsPerUser;
    private Long              triggerCount;
    private LocalDateTime     lastTriggeredAt;
    private LocalDateTime     createdAt;
}