package com.gamification.backend.repository;

import com.gamification.backend.model.IncomingEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IncomingEventRepository extends JpaRepository<IncomingEvent, Long> {
    List<IncomingEvent> findByAppIdAndProcessedFalse(Long appId);
    List<IncomingEvent> findByUserIdAndEventName(String userId, String eventName);
    long countByUserIdAndEventNameAndCreatedAtBetween(String userId, String eventName, 
                                                      LocalDateTime start, LocalDateTime end);
}