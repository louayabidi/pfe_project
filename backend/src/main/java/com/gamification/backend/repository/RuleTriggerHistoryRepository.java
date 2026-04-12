package com.gamification.backend.repository;

import com.gamification.backend.model.RuleTriggerHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RuleTriggerHistoryRepository extends JpaRepository<RuleTriggerHistory, Long> {

    /**
     * Compte combien de fois une règle a été accordée à un utilisateur.
     * Utilisé pour vérifier maxAwardsPerUser.
     */
    long countByRuleIdAndUserId(Long ruleId, String userId);

    /**
     * Récupère le dernier déclenchement de la règle pour cet utilisateur.
     * Utilisé pour vérifier le cooldown.
     */
    @Query("""
        SELECT h FROM RuleTriggerHistory h
        WHERE h.ruleId = :ruleId
          AND h.userId = :userId
        ORDER BY h.triggeredAt DESC
        LIMIT 1
        """)
    Optional<RuleTriggerHistory> findLastTrigger(
        @Param("ruleId") Long ruleId,
        @Param("userId") String userId
    );

    /**
     * Compte les fois où la règle a été déclenchée pour cet user
     * DANS une fenêtre temporelle (pour EVENT_COUNT + TIME_PERIOD combinés).
     */
    @Query("""
        SELECT COUNT(h) FROM RuleTriggerHistory h
        WHERE h.ruleId = :ruleId
          AND h.userId = :userId
          AND h.triggeredAt >= :since
        """)
    long countByRuleIdAndUserIdSince(
        @Param("ruleId")  Long ruleId,
        @Param("userId")  String userId,
        @Param("since")   LocalDateTime since
    );

    /** Supprime l'historique d'une app lors de sa suppression */
    void deleteByAppId(Long appId);
}