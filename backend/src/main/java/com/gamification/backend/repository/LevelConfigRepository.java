package com.gamification.backend.repository;

import com.gamification.backend.model.LevelConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LevelConfigRepository extends JpaRepository<LevelConfig, Long> {
    List<LevelConfig> findByAppId(Long appId);
    List<LevelConfig> findByAppIdAndActiveTrue(Long appId);
    void deleteByAppId(Long appId);
}