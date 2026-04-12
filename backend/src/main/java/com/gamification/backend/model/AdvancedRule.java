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
@Table(name = "rules_advanced")
public class AdvancedRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── BASIC INFO ───────────────────────────────────────────────────────
    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

 @ElementCollection(fetch = FetchType.EAGER)
@CollectionTable(name = "rule_trigger_events", joinColumns = @JoinColumn(name = "rule_id"))
@Column(name = "event_name")
private List<String> triggerEvents;

    // ── CONDITION LOGIC ──────────────────────────────────────────────────
    /**
     * "AND" = all conditions must match
     * "OR" = at least one condition must match
     */
    @Builder.Default
    @Column(name = "condition_logic")
    private String conditionLogic = "AND";

    /**
     * Stored as JSON: List<AdvancedCondition>
     */
    @JdbcTypeCode(SqlTypes.JSON)
    private List<AdvancedCondition> conditions;

    // ── ACTIONS ──────────────────────────────────────────────────────────
    /**
     * Multiple actions can be triggered by a single rule
     * Stored as JSON: List<AdvancedAction>
     */
    @JdbcTypeCode(SqlTypes.JSON)
    private List<AdvancedAction> actions;

    // ── RULE BEHAVIOR ────────────────────────────────────────────────────
    @Builder.Default
    private Integer priority = 0;

    @Column(name = "cooldown_minutes")
    private Integer cooldownMinutes;

    @Column(name = "max_awards_per_user")
    private Integer maxAwardsPerUser;

    /**
     * Time window for counting occurrences (in days)
     * Used for conditions like "2x purchases per week"
     */
    @Column(name = "counting_window_days")
    private Integer countingWindowDays;

    // ── STATUS ───────────────────────────────────────────────────────────
    @Builder.Default
    @Column(name = "is_active")
    private Boolean active = true;

    /**
     * Version number for rule updates
     * Helps track rule evolution
     */
    @Builder.Default
    @Column(name = "version")
    private Integer version = 1;

    // ── RELATIONSHIPS ────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    // ── METADATA ─────────────────────────────────────────────────────────
    /**
     * For storing complex rule logic, test conditions, etc.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;

    /**
     * How many times this rule has been triggered (aggregate)
     */
    @Builder.Default
    @Column(name = "trigger_count")
    private Long triggerCount = 0L;

    /**
     * Last time this rule was evaluated
     */
    @Column(name = "last_triggered_at")
    private LocalDateTime lastTriggeredAt;

    // ── TIMESTAMPS ───────────────────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ═══════════════════════════════════════════════════════════════════════
    // NESTED CLASSES
    // ═══════════════════════════════════════════════════════════════════════

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvancedCondition {
        private String type; // EVENT, EVENT_COUNT, TIME_PERIOD, DATA_FIELD
        private String field;
        private String operator;
        private Object value;
        private String valueType;
        private String description;

        /**
         * Evaluate if this condition is met
         * (simplified — actual evaluation would be more complex)
         */
        public boolean evaluate(Object actual) {
            if (actual == null) return false;

            switch (operator) {
                case "EQUALS":
                    return actual.equals(value);
                case "GREATER_THAN":
                    return compareNumeric(actual) > 0;
                case "LESS_THAN":
                    return compareNumeric(actual) < 0;
                case "CONTAINS":
                    return actual.toString().contains(value.toString());
                case "IN":
                    return value instanceof List && ((List<?>) value).contains(actual);
                default:
                    return false;
            }
        }

        private int compareNumeric(Object actual) {
            try {
                double a = Double.parseDouble(actual.toString());
                double v = Double.parseDouble(value.toString());
                return Double.compare(a, v);
            } catch (NumberFormatException e) {
                return 0;
            }
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvancedAction {
        private String type; // POINTS, BADGE, MULTIPLIER, CUSTOM
        private Object value;
        private Map<String, Object> params;
        private String executeIf;
        private Integer delayMinutes;
        private String description;
    }
}