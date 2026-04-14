package com.gamification.backend.repository;

import com.gamification.backend.model.WidgetConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WidgetConfigRepository extends JpaRepository<WidgetConfig, Long> {
    Optional<WidgetConfig> findByPublishableKey(String publishableKey);
    List<WidgetConfig> findByAppId(Long appId);
    Optional<WidgetConfig> findByAppIdAndName(Long appId, String name);
}