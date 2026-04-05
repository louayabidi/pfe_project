package com.gamification.backend.repository;


import com.gamification.backend.model.IncomingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsRepository extends JpaRepository<IncomingEvent, Long> {

    // ── KPIs ────────────────────────────────────────────────────────────────

    @Query("SELECT COUNT(e) FROM IncomingEvent e WHERE e.app.id = :appId")
    long countTotalEvents(@Param("appId") Long appId);

    @Query("SELECT COUNT(DISTINCT e.userId) FROM IncomingEvent e WHERE e.app.id = :appId")
    long countTotalUsers(@Param("appId") Long appId);

    @Query("SELECT COUNT(DISTINCT e.userId) FROM IncomingEvent e " +
           "WHERE e.app.id = :appId AND e.createdAt >= :since")
    long countActiveUsersSince(
        @Param("appId") Long appId,
        @Param("since") LocalDateTime since
    );

    // ── Events per day ───────────────────────────────────────────────────────

    @Query(value = """
        SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date, COUNT(*) AS value
        FROM incoming_events
        WHERE app_id = :appId AND created_at >= :since
        GROUP BY date
        ORDER BY date ASC
        """, nativeQuery = true)
    List<Object[]> findEventsByDay(
        @Param("appId") Long appId,
        @Param("since") LocalDateTime since
    );

    // ── New users per day ────────────────────────────────────────────────────

    @Query(value = """
        SELECT TO_CHAR(first_seen, 'YYYY-MM-DD') AS date, COUNT(*) AS value
        FROM (
            SELECT user_id, MIN(created_at) AS first_seen
            FROM incoming_events
            WHERE app_id = :appId AND created_at >= :since
            GROUP BY user_id
        ) first_appearances
        GROUP BY date
        ORDER BY date ASC
        """, nativeQuery = true)
    List<Object[]> findNewUsersByDay(
        @Param("appId") Long appId,
        @Param("since") LocalDateTime since
    );

    // ── Top events ───────────────────────────────────────────────────────────

    @Query(value = """
        SELECT event_name AS label, COUNT(*) AS value
        FROM incoming_events
        WHERE app_id = :appId AND created_at >= :since
        GROUP BY event_name
        ORDER BY value DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Object[]> findTopEvents(
        @Param("appId") Long appId,
        @Param("since") LocalDateTime since
    );

    // ── Top users ────────────────────────────────────────────────────────────

    @Query(value = """
        SELECT user_id AS label, COUNT(*) AS value
        FROM incoming_events
        WHERE app_id = :appId AND created_at >= :since
        GROUP BY user_id
        ORDER BY value DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Object[]> findTopUsers(
        @Param("appId") Long appId,
        @Param("since") LocalDateTime since
    );

    // ── Heatmap (day of week × hour) ─────────────────────────────────────────

    @Query(value = """
        SELECT
            EXTRACT(DOW  FROM created_at)::int AS day_of_week,
            EXTRACT(HOUR FROM created_at)::int AS hour,
            COUNT(*) AS count
        FROM incoming_events
        WHERE app_id = :appId AND created_at >= :since
        GROUP BY day_of_week, hour
        ORDER BY day_of_week, hour
        """, nativeQuery = true)
    List<Object[]> findHeatmap(
        @Param("appId") Long appId,
        @Param("since") LocalDateTime since
    );

    // ── Retention cohorts ────────────────────────────────────────────────────

    @Query(value = """
        WITH cohorts AS (
            SELECT user_id,
                   DATE_TRUNC('week', MIN(created_at)) AS cohort_week
            FROM incoming_events
            WHERE app_id = :appId
            GROUP BY user_id
        ),
        activity AS (
            SELECT e.user_id,
                   DATE_TRUNC('week', e.created_at) AS activity_week,
                   c.cohort_week
            FROM incoming_events e
            JOIN cohorts c ON e.user_id = c.user_id
            WHERE e.app_id = :appId
        )
        SELECT
            TO_CHAR(cohort_week, 'YYYY-MM-DD')  AS cohort,
           (EXTRACT(DAY FROM (activity_week - cohort_week)) / 7)::int AS week_number,
            COUNT(DISTINCT user_id) AS users
        FROM activity
        GROUP BY cohort, week_number
        ORDER BY cohort, week_number
        """, nativeQuery = true)
    List<Object[]> findRetentionCohorts(@Param("appId") Long appId);

    // ── Badge distribution ───────────────────────────────────────────────────

    @Query(value = """
        SELECT b.name AS label, COUNT(ub.id) AS value
        FROM user_badges ub
        JOIN badges b ON b.id = ub.badge_id
        WHERE b.app_id = :appId
        GROUP BY b.name
        ORDER BY value DESC
        """, nativeQuery = true)
    List<Object[]> findBadgeDistribution(@Param("appId") Long appId);

    // ── Total points awarded ─────────────────────────────────────────────────

    @Query(value = """
        SELECT COALESCE(SUM(pb.lifetime_earned), 0)
        FROM points_balance pb
        WHERE pb.app_id = :appId
        """, nativeQuery = true)
    long sumTotalPointsAwarded(@Param("appId") Long appId);

    // ── Total badges awarded ─────────────────────────────────────────────────

    @Query(value = """
        SELECT COUNT(ub.id)
        FROM user_badges ub
        JOIN badges b ON b.id = ub.badge_id
        WHERE b.app_id = :appId
        """, nativeQuery = true)
    long countTotalBadgesAwarded(@Param("appId") Long appId);
}