// ── StreakConfigRepository.java ───────────────────────────────────────────────
package com.gamification.backend.repository;

import com.gamification.backend.model.StreakConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StreakConfigRepository extends JpaRepository<StreakConfig, Long> {
    List<StreakConfig> findByAppId(Long appId);
    List<StreakConfig> findByAppIdAndActiveTrue(Long appId);
    void deleteByAppId(Long appId);
}