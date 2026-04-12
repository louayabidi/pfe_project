package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Enregistre chaque fois qu'une règle avancée est déclenchée pour un utilisateur.
 * Utilisé pour :
 *   - Vérifier le cooldown (dernière fois que la règle a été déclenchée pour cet user)
 *   - Compter le nombre d'awards pour respecter maxAwardsPerUser
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rule_trigger_history",
    indexes = {
        @Index(name = "idx_rth_rule_user",    columnList = "rule_id, user_id"),
        @Index(name = "idx_rth_user_app",     columnList = "user_id, app_id"),
        @Index(name = "idx_rth_triggered_at", columnList = "triggered_at")
    }
)
public class RuleTriggerHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_id", nullable = false)
    private Long ruleId;

    @Column(name = "app_id", nullable = false)
    private Long appId;

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @CreationTimestamp
    @Column(name = "triggered_at", nullable = false, updatable = false)
    private LocalDateTime triggeredAt;
}