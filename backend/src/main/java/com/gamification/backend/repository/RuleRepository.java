package com.gamification.backend.repository;

import com.gamification.backend.model.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {
    List<Rule> findByAppId(Long appId);
    List<Rule> findByAppIdAndActiveTrue(Long appId);
    List<Rule> findByAppIdAndTriggerEventAndActiveTrue(Long appId, String triggerEvent);
    void deleteByAppId(Long appId);


    @Query("SELECT COUNT(r) FROM Rule r WHERE r.app.owner.id = :ownerId")
long countByAppOwnerId(@Param("ownerId") Long ownerId);
}