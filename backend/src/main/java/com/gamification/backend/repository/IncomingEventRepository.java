package com.gamification.backend.repository;

import com.gamification.backend.model.IncomingEvent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IncomingEventRepository
        extends JpaRepository<IncomingEvent, Long>,
                JpaSpecificationExecutor<IncomingEvent> {

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


    @Query("SELECT COUNT(e) FROM IncomingEvent e WHERE e.app.id = :appId AND e.userId = :userId AND e.eventName = :eventName")
long countByAppIdAndUserIdAndEventName(
    @Param("appId") Long appId,
    @Param("userId") String userId,
    @Param("eventName") String eventName
);



// Used by outcome tracker to check if user came back after an AI action
@Query("""
    SELECT COUNT(e) > 0 FROM IncomingEvent e
    WHERE e.app.id = :appId
      AND e.userId = :userId
      AND e.createdAt > :after
    """)
boolean existsByAppIdAndUserIdAfter(
    @Param("appId")  Long appId,
    @Param("userId") String userId,
    @Param("after")  java.time.LocalDateTime after
);

@Query("SELECT DISTINCT e.displayName FROM IncomingEvent e WHERE e.app.id = :appId AND e.displayName IS NOT NULL ORDER BY e.displayName")
List<String> findDistinctDisplayNamesByAppId(@Param("appId") Long appId);





}

