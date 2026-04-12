package com.gamification.backend.dto.rule;
 
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;
import java.util.Map;
 
@Data
public class CreateAdvancedRuleRequest {
 
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 200)
    private String name;
 
    @Size(max = 500)
    private String description;
 
   @NotNull @Size(min = 1)
private List<String> triggerEvents; 
 
    /** "AND" (défaut) ou "OR" */
    private String conditionLogic = "AND";
 
    @Valid
    private List<ConditionDto> conditions;
 
    @NotNull(message = "Au moins une action est requise")
    @Size(min = 1, message = "Au moins une action est requise")
    @Valid
    private List<ActionDto> actions;
 
    private Integer priority         = 0;
    private Integer cooldownMinutes;
    private Integer maxAwardsPerUser;
 
    // ── Condition ─────────────────────────────────────────────────────────
 
    @Data
    public static class ConditionDto {
        /**
         * Type : EVENT | EVENT_COUNT | TIME_PERIOD | DATA_FIELD
         */
        @NotBlank
        private String type;
 
        /** Nom de l'événement ou nom du champ data */
        private String field;
 
        /**
         * Opérateur : EQUALS | NOT_EQUALS | GREATER_THAN | LESS_THAN |
         *             GREATER_THAN_OR_EQUAL | LESS_THAN_OR_EQUAL | CONTAINS | WITHIN
         */
        private String operator;
 
        /**
         * Valeur de comparaison.
         * Exemples : 10 (nombre), "7_DAYS" (période), "premium" (string)
         */
        private Object value;
    }
 
    // ── Action ────────────────────────────────────────────────────────────
 
    @Data
    public static class ActionDto {
        /**
         * Type : POINTS | BADGE | MULTIPLIER | CUSTOM
         */
        @NotBlank
        private String type;
 
        /**
         * Valeur de l'action :
         *   POINTS     → Integer
         *   BADGE      → Long (badgeId)
         *   MULTIPLIER → Double
         *   CUSTOM     → null (utiliser params)
         */
        private Object value;
 
        /** Message affiché à l'utilisateur */
        private String description;
 
        /** Paramètres libres pour CUSTOM */
        private Map<String, Object> params;
    }
}
 
 