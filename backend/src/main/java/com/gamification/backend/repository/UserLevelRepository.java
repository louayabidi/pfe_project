package com.gamification.backend.repository;

import com.gamification.backend.model.UserLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserLevelRepository extends JpaRepository<UserLevel, Long> {
    Optional<UserLevel> findByUserIdAndLevelConfigId(String userId, Long levelConfigId);
    List<UserLevel> findByUserIdAndAppId(String userId, Long appId);
    void deleteByAppId(Long appId);
}