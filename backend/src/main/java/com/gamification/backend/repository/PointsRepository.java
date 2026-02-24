package com.gamification.backend.repository;

import com.gamification.backend.model.PointsBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PointsRepository extends JpaRepository<PointsBalance, Long> {
    Optional<PointsBalance> findByUserIdAndAppId(String userId, Long appId);
}