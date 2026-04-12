package com.gamification.backend.repository;

import com.gamification.backend.model.AdvancedRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdvancedRuleRepository extends JpaRepository<AdvancedRule, Long> {

    /** Toutes les règles d'une app (actives ou non), pour le dashboard */
    List<AdvancedRule> findByAppIdOrderByPriorityDesc(Long appId);

    /** Règles actives d'une app triées par priorité (pour affichage dashboard) */
    List<AdvancedRule> findByAppIdAndActiveTrueOrderByPriorityDesc(Long appId);

    /**
     * Règles actives pour un événement donné, triées par priorité décroissante.
     * C'est la requête principale utilisée lors du tracking.
     */
@Query("""
    SELECT DISTINCT r FROM AdvancedRule r
    JOIN r.triggerEvents e
    WHERE r.app.id = :appId
      AND r.active = true
      AND e = :eventName
    ORDER BY r.priority DESC
    """)
List<AdvancedRule> findActiveRulesByEvent(
    @Param("appId") Long appId,
    @Param("eventName") String eventName
);

    /** Supprime toutes les règles d'une app (cascade lors de la suppression de l'app) */
    void deleteByAppId(Long appId);

    @Query("SELECT COUNT(r) FROM AdvancedRule r WHERE r.app.owner.id = :ownerId")
long countByAppOwnerId(@Param("ownerId") Long ownerId);
}