package com.gamification.backend.repository;

import com.gamification.backend.model.UserStreak;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserStreakRepository extends JpaRepository<UserStreak, Long> {
    Optional<UserStreak> findByUserIdAndStreakConfigId(String userId, Long streakConfigId);
    List<UserStreak> findByUserIdAndAppId(String userId, Long appId);
    void deleteByAppId(Long appId);
}