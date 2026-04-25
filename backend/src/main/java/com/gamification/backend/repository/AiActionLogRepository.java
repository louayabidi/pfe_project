package com.gamification.backend.repository;

import com.gamification.backend.model.AiActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AiActionLogRepository extends JpaRepository<AiActionLog, Long> {

    // Check if we already acted on this user recently (prevents spam)
    @Query("""
        SELECT COUNT(a) > 0 FROM AiActionLog a
        WHERE a.appId = :appId
          AND a.userId = :userId
          AND a.firedAt >= :since
        """)
    boolean existsRecentAction(
        @Param("appId")  Long appId,
        @Param("userId") String userId,
        @Param("since")  LocalDateTime since
    );

    // Find all actions not yet scored (for outcome tracking)
    @Query("""
        SELECT a FROM AiActionLog a
        WHERE a.outcomeCheckedAt IS NULL
          AND a.firedAt < :cutoff
        """)
    List<AiActionLog> findUnscoredActions(@Param("cutoff") LocalDateTime cutoff);

    // Stats per segment (for your dashboard)
    @Query(value = """
        SELECT 
            segment,
            action_type,
            COUNT(*) AS total,
            SUM(CASE WHEN did_return = true THEN 1 ELSE 0 END) AS returned,
            ROUND(100.0 * SUM(CASE WHEN did_return = true THEN 1 ELSE 0 END) 
                  / NULLIF(COUNT(*), 0), 1) AS return_rate
        FROM ai_action_log
        WHERE app_id = :appId
          AND outcome_checked_at IS NOT NULL
        GROUP BY segment, action_type
        ORDER BY return_rate DESC
        """, nativeQuery = true)
    List<Object[]> findSegmentStats(@Param("appId") Long appId);
}