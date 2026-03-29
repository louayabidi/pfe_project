package com.gamification.backend.repository;

import com.gamification.backend.model.IncomingEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface IncomingEventRepository extends JpaRepository<IncomingEvent, Long> {

    // ── Requête simple sans filtres ──────────────────────────────────────────
    Page<IncomingEvent> findByAppIdOrderByCreatedAtDesc(
        Long appId, Pageable pageable
    );

    // ── Requête avec filtres — uniquement les non-null ───────────────────────
    @Query("""
        SELECT e FROM IncomingEvent e
        WHERE e.app.id = :appId
        AND (:userId    IS NULL OR e.userId    = :userId)
        AND (:eventName IS NULL OR e.eventName = :eventName)
        AND (:from      IS NULL OR e.createdAt >= :from)
        AND (:to        IS NULL OR e.createdAt <= :to)
        ORDER BY e.createdAt DESC
    """)
    Page<IncomingEvent> findWithFilters(
        @Param("appId")     Long          appId,
        @Param("userId")    String        userId,
        @Param("eventName") String        eventName,
        @Param("from")      LocalDateTime from,
        @Param("to")        LocalDateTime to,
        Pageable            pageable
    );

    @Query("SELECT DISTINCT e.userId FROM IncomingEvent e " +
           "WHERE e.app.id = :appId ORDER BY e.userId")
    List<String> findDistinctUserIdsByAppId(@Param("appId") Long appId);

    @Query("SELECT DISTINCT e.eventName FROM IncomingEvent e " +
           "WHERE e.app.id = :appId ORDER BY e.eventName")
    List<String> findDistinctEventNamesByAppId(@Param("appId") Long appId);

    @Query("SELECT COUNT(e) FROM IncomingEvent e WHERE e.app.id = :appId")
    long countByAppId(@Param("appId") Long appId);

    @Modifying
    @Query("DELETE FROM IncomingEvent e WHERE e.app.id = :appId")
    void deleteByAppId(@Param("appId") Long appId);
}