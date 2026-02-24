package com.gamification.backend.service;

import com.gamification.backend.dto.event.RewardResponse;
import com.gamification.backend.model.*;
import com.gamification.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RuleEngineService {
    
    private final RuleRepository ruleRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final PointsRepository pointsRepository;
    private final PointsTransactionRepository pointsTransactionRepository; // ✅ Changé ici
    
    @Transactional
    public List<RewardResponse> evaluateEvent(IncomingEvent event) {
        List<RewardResponse> rewards = new ArrayList<>();
        
        List<Rule> rules = ruleRepository.findByAppIdAndTriggerEventAndActiveTrue(
                event.getApp().getId(), 
                event.getEventName()
        );
        
        log.info("Évaluation de {} règles pour l'événement {}", rules.size(), event.getEventName());
        
        for (Rule rule : rules) {
            if (evaluateConditions(rule, event)) {
                List<RewardResponse> ruleRewards = executeActions(rule, event);
                rewards.addAll(ruleRewards);
                log.info("Règle {} exécutée, {} récompenses générées", rule.getName(), ruleRewards.size());
            }
        }
        
        return rewards;
    }
    
    private boolean evaluateConditions(Rule rule, IncomingEvent event) {
        if (rule.getConditions() == null || rule.getConditions().isEmpty()) {
            return true;
        }
        
        for (Rule.Condition condition : rule.getConditions()) {
            if (!evaluateCondition(condition, event)) {
                return false;
            }
        }
        
        return true;
    }
    
    private boolean evaluateCondition(Rule.Condition condition, IncomingEvent event) {
        Object actualValue = extractValue(condition.getField(), event);
        
        if (actualValue == null) {
            return false;
        }
        
        return switch (condition.getOperator().toUpperCase()) {
            case "EQUALS" -> actualValue.toString().equals(condition.getValue().toString());
            case "GREATER_THAN" -> {
                if (actualValue instanceof Number && condition.getValue() instanceof Number) {
                    yield ((Number) actualValue).doubleValue() > ((Number) condition.getValue()).doubleValue();
                }
                yield false;
            }
            case "LESS_THAN" -> {
                if (actualValue instanceof Number && condition.getValue() instanceof Number) {
                    yield ((Number) actualValue).doubleValue() < ((Number) condition.getValue()).doubleValue();
                }
                yield false;
            }
            case "CONTAINS" -> actualValue.toString().contains(condition.getValue().toString());
            default -> false;
        };
    }
    
    private Object extractValue(String field, IncomingEvent event) {
        if (field == null) return null;
        
        String[] parts = field.split("\\.");
        
        if (parts[0].equals("data") && event.getEventData() != null) {
            return parts.length > 1 ? event.getEventData().get(parts[1]) : event.getEventData();
        }
        
        return switch (field) {
            case "userId" -> event.getUserId();
            case "eventName" -> event.getEventName();
            default -> null;
        };
    }
    
    private List<RewardResponse> executeActions(Rule rule, IncomingEvent event) {
        List<RewardResponse> rewards = new ArrayList<>();
        
        for (Rule.Action action : rule.getActions()) {
            try {
                RewardResponse reward = switch (action.getType().toUpperCase()) {
                    case "BADGE" -> awardBadge(action, event, rule);
                    case "POINTS" -> addPoints(action, event, rule);
                    default -> null;
                };
                
                if (reward != null) {
                    rewards.add(reward);
                }
            } catch (Exception e) {
                log.error("Erreur lors de l'exécution de l'action: {}", e.getMessage());
            }
        }
        
        return rewards;
    }
    
    private RewardResponse awardBadge(Rule.Action action, IncomingEvent event, Rule rule) {
        if (action.getTargetId() == null) {
            return null;
        }
        
        boolean hasBadge = userBadgeRepository.existsByUserIdAndBadgeId(
                event.getUserId(), action.getTargetId());
        
        if (hasBadge) {
            return null;
        }
        
        UserBadge userBadge = UserBadge.builder()
                .userId(event.getUserId())
                .badgeId(action.getTargetId()) 
                .build();
        
        userBadgeRepository.save(userBadge);
        
        return RewardResponse.builder()
                .type("BADGE")
                .data(Map.of("badgeId", action.getTargetId()))
                .message("Badge débloqué !")
                .build();
    }
    
    private RewardResponse addPoints(Rule.Action action, IncomingEvent event, Rule rule) {
        if (action.getPointsAmount() == null || action.getPointsAmount() == 0) {
            return null;
        }
        
        PointsBalance balance = pointsRepository.findByUserIdAndAppId(
                event.getUserId(), event.getApp().getId())
                .orElseGet(() -> PointsBalance.builder()
                        .userId(event.getUserId())
                        .app(event.getApp())
                        .balance(0)
                        .lifetimeEarned(0)
                        .build());
        
        int newBalance = balance.getBalance() + action.getPointsAmount();
        balance.setBalance(newBalance);
        balance.setLifetimeEarned(balance.getLifetimeEarned() + action.getPointsAmount());
        
        pointsRepository.save(balance);
        
        PointsTransaction transaction = PointsTransaction.builder()
                .userId(event.getUserId())
                .app(event.getApp())
                .amount(action.getPointsAmount())
                .type("EARN")
                .reason("Règle: " + rule.getName())
                .ruleId(rule.getId())
                .balanceAfter(newBalance)
                .build();
        
        pointsTransactionRepository.save(transaction); 
        
        return RewardResponse.builder()
                .type("POINTS")
                .data(Map.of(
                    "amount", action.getPointsAmount(),
                    "newBalance", newBalance
                ))
                .message("+" + action.getPointsAmount() + " points !")
                .build();
    }
}