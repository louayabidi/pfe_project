package com.gamification.backend.repository;

import com.gamification.backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByAppId(Long appId);
    boolean existsByNameAndAppId(String name, Long appId);
    long countByAppId(Long appId);
}