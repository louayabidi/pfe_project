package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
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
@Table(name = "rules_advanced",
    indexes = {
        @Index(name = "idx_adv_rule_app",      columnList = "app_id"),
        @Index(name = "idx_adv_rule_event",    columnList = "app_id, trigger_event"),
        @Index(name = "idx_adv_rule_active",   columnList = "app_id, is_active"),
        @Index(name = "idx_adv_rule_priority", columnList = "app_id, is_active, priority")
    }
)
public class AdvancedRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "rule_trigger_events", joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "event_name")
    private List<String> triggerEvents;

    /**
     * Logique de combinaison des conditions : "AND" ou "OR"
     * AND = toutes les conditions doivent être vraies
     * OR  = au moins une condition doit être vraie
     */
    @Builder.Default
    @Column(name = "condition_logic", nullable = false, length = 10)
    private String conditionLogic = "AND";

    /**
     * Liste de conditions sérialisées en JSON.
     * Chaque condition a : type, field, operator, value
     *
     * Types supportés :
     *   EVENT        — l'événement correspond à un nom donné
     *   EVENT_COUNT  — l'événement a été déclenché N fois (nécessite rule_trigger_history)
     *   TIME_PERIOD  — dans une fenêtre temporelle (1_HOUR, 1_DAY, 7_DAYS, 30_DAYS)
     *   DATA_FIELD   — un champ de event.data satisfait une comparaison
     */
    @JdbcTypeCode(SqlTypes.JSON)
    private List<AdvancedCondition> conditions;

    /**
     * Liste d'actions à exécuter si les conditions sont satisfaites.
     *
     * Types supportés :
     *   POINTS     — créditer des points (value = montant entier)
     *   BADGE      — attribuer un badge  (value = badgeId long)
     *   MULTIPLIER — appliquer un multiplicateur (value = double, ex: 2.0)
     *   CUSTOM     — action personnalisée via params
     */
    @JdbcTypeCode(SqlTypes.JSON)
    private List<AdvancedAction> actions;

    @Builder.Default
    private Integer priority = 0;

    @Column(name = "cooldown_minutes")
    private Integer cooldownMinutes;

    @Column(name = "max_awards_per_user")
    private Integer maxAwardsPerUser;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    @Builder.Default
    @Column(name = "trigger_count", nullable = false)
    private Long triggerCount = 0L;

    @Column(name = "last_triggered_at")
    private LocalDateTime lastTriggeredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // =========================================================================
    // NESTED: Condition
    // =========================================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvancedCondition {

        /** Type de condition : EVENT | EVENT_COUNT | TIME_PERIOD | DATA_FIELD */
        private String type;

        /** Champ cible (nom de l'événement, nom du champ dans data, etc.) */
        private String field;

        /**
         * Opérateur de comparaison :
         * EQUALS | NOT_EQUALS | GREATER_THAN | LESS_THAN |
         * GREATER_THAN_OR_EQUAL | LESS_THAN_OR_EQUAL | CONTAINS | WITHIN
         */
        private String operator;

        /** Valeur de comparaison (String, Number, "7_DAYS", etc.) */
        private Object value;

        /**
         * Évalue si une valeur réelle satisfait cette condition.
         * Utilisé pour DATA_FIELD et EVENT_COUNT.
         */
        public boolean evaluate(Object actual) {
            if (actual == null || value == null) return false;

            String op = operator != null ? operator.toUpperCase() : "EQUALS";

            switch (op) {
                case "EQUALS":
                    return String.valueOf(actual).equalsIgnoreCase(String.valueOf(value));

                case "NOT_EQUALS":
                    return !String.valueOf(actual).equalsIgnoreCase(String.valueOf(value));

                case "CONTAINS":
                    return String.valueOf(actual).contains(String.valueOf(value));

                case "GREATER_THAN":
                    return toDouble(actual) > toDouble(value);

                case "LESS_THAN":
                    return toDouble(actual) < toDouble(value);

                case "GREATER_THAN_OR_EQUAL":
                    return toDouble(actual) >= toDouble(value);

                case "LESS_THAN_OR_EQUAL":
                    return toDouble(actual) <= toDouble(value);

                default:
                    return false;
            }
        }

        private double toDouble(Object o) {
            try {
                return Double.parseDouble(String.valueOf(o));
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
    }

    // =========================================================================
    // NESTED: Action
    // =========================================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvancedAction {

        /** Type d'action : POINTS | BADGE | MULTIPLIER | CUSTOM */
        private String type;

        /**
         * Valeur de l'action :
         *   POINTS     → Integer (ex: 100)
         *   BADGE      → Long    (ex: 3)
         *   MULTIPLIER → Double  (ex: 2.0)
         *   CUSTOM     → String (description de l'action)
         */
        private Object value;

        /** Message affiché à l'utilisateur quand la récompense est obtenue */
        private String description;

        /** Paramètres additionnels pour les actions CUSTOM */
        private Map<String, Object> params;
    }
}