package com.gamification.backend.repository;

import com.gamification.backend.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(String userId);
    Optional<UserBadge> findByUserIdAndBadgeId(String userId, Long badgeId);
    boolean existsByUserIdAndBadgeId(String userId, Long badgeId);
    long countByUserId(String userId);
}