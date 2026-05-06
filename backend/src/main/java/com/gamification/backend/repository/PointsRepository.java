package com.gamification.backend.repository;

import com.gamification.backend.model.PointsBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PointsRepository extends JpaRepository<PointsBalance, Long> {

    
    @Query("SELECT p FROM PointsBalance p WHERE p.userId = :userId AND p.app.id = :appId")
    Optional<PointsBalance> findByUserIdAndAppId(
        @Param("userId") String userId,
        @Param("appId")  Long appId
    );

    void deleteByAppId(Long appId);
}