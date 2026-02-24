package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rules")
public class Rule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(name = "trigger_event", nullable = false)
    private String triggerEvent;
    
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Condition> conditions;
    
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Action> actions;
    
    @Builder.Default
    private Integer priority = 0;
    
    @Column(name = "cooldown_minutes")
    private Integer cooldownMinutes;
    
    @Column(name = "max_awards_per_user")
    private Integer maxAwardsPerUser;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean active = true;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Condition {
        private String field;
        private String operator; // "EQUALS", "GREATER_THAN", "LESS_THAN", "CONTAINS"
        private Object value;
        private String valueType; // "string", "number", "boolean"
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Action {
        private String type; // "BADGE", "POINTS"
        private Long targetId; // badgeId pour BADGE, null pour POINTS
        private Integer pointsAmount; // pour POINTS
        private Map<String, Object> params;
    }
}