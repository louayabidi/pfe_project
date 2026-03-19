package com.gamification.backend.repository;

import com.gamification.backend.model.RegisteredEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegisteredEventRepository extends JpaRepository<RegisteredEvent, Long> {
    List<RegisteredEvent> findByAppId(Long appId);
    boolean existsByAppIdAndEventName(Long appId, String eventName);
    void deleteByAppIdAndEventName(Long appId, String eventName);
    void deleteByAppId(Long appId);

}