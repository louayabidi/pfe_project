package com.gamification.backend.service;

import com.gamification.backend.dto.rule.CreateRuleRequest;
import com.gamification.backend.dto.rule.RuleResponse;
import com.gamification.backend.model.App;
import com.gamification.backend.model.Rule;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RuleService {
    
    private final RuleRepository ruleRepository;
    private final AppRepository appRepository;
    
    @Transactional
    public RuleResponse createRule(Long appId, CreateRuleRequest request) {
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application non trouvée"));
        
        List<Rule.Condition> conditions = null;
        if (request.getConditions() != null) {
            conditions = request.getConditions().stream()
                    .map(c -> Rule.Condition.builder()
                            .field(c.getField())
                            .operator(c.getOperator())
                            .value(c.getValue())
                            .valueType(c.getValueType())
                            .build())
                    .collect(Collectors.toList());
        }
        
        List<Rule.Action> actions = request.getActions().stream()
                .map(a -> Rule.Action.builder()
                        .type(a.getType())
                        .targetId(a.getBadgeId())
                        .pointsAmount(a.getPointsAmount())
                        .params(a.getParams())
                        .build())
                .collect(Collectors.toList());
        
        Rule rule = Rule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .triggerEvent(request.getTriggerEvent())
                .conditions(conditions)
                .actions(actions)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .cooldownMinutes(request.getCooldownMinutes())
                .maxAwardsPerUser(request.getMaxAwardsPerUser())
                .active(true)
                .app(app)
                .build();
        
        Rule savedRule = ruleRepository.save(rule);
        log.info("Règle créée: {} pour l'app {}", savedRule.getName(), appId);
        
        return mapToResponse(savedRule);
    }
    
    public List<RuleResponse> getRulesByAppId(Long appId) {
        return ruleRepository.findByAppId(appId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public RuleResponse toggleRule(Long ruleId, Boolean active) {
        Rule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Règle non trouvée"));
        rule.setActive(active);
        Rule updatedRule = ruleRepository.save(rule);
        log.info("Règle {} activée: {}", ruleId, active);
        return mapToResponse(updatedRule);
    }
    
    @Transactional
    public void deleteRule(Long ruleId) {
        Rule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Règle non trouvée"));
        ruleRepository.delete(rule);
        log.info("Règle supprimée: {}", ruleId);
    }
    
    private RuleResponse mapToResponse(Rule rule) {
        List<Map<String, Object>> conditionList = null;
        if (rule.getConditions() != null) {
            conditionList = rule.getConditions().stream()
                    .map(c -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("field", c.getField());
                        map.put("operator", c.getOperator());
                        map.put("value", c.getValue());
                        return map;
                    })
                    .collect(Collectors.toList());
        }
        
        List<Map<String, Object>> actionList = rule.getActions().stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", a.getType());
                    map.put("targetId", a.getTargetId());
                    map.put("pointsAmount", a.getPointsAmount());
                    if (a.getParams() != null) {
                        map.put("params", a.getParams());
                    }
                    return map;
                })
                .collect(Collectors.toList());
        
        return RuleResponse.builder()
                .id(rule.getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .triggerEvent(rule.getTriggerEvent())
                .conditions(conditionList)
                .actions(actionList)
                .priority(rule.getPriority())
                .active(rule.getActive())
                .createdAt(rule.getCreatedAt())
                .build();
    }
}