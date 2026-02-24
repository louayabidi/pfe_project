package com.gamification.backend.repository;

import com.gamification.backend.model.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {
    List<Rule> findByAppId(Long appId);
    List<Rule> findByAppIdAndActiveTrue(Long appId);
    List<Rule> findByAppIdAndTriggerEventAndActiveTrue(Long appId, String triggerEvent);
}