package com.gamification.backend.service;
 
import com.gamification.backend.dto.rule.CreateAdvancedRuleRequest;
import com.gamification.backend.dto.rule.RuleResponse;
import com.gamification.backend.model.AdvancedRule;
import com.gamification.backend.model.App;
import com.gamification.backend.repository.AdvancedRuleRepository;
import com.gamification.backend.repository.AppRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
 
@Slf4j
@Service
@RequiredArgsConstructor
public class AdvancedRuleService {
 
    private final AdvancedRuleRepository ruleRepository;
    private final AppRepository          appRepository;
 
    // ── CRUD ──────────────────────────────────────────────────────────────────
 
    @Transactional
    public RuleResponse createRule(Long appId, CreateAdvancedRuleRequest req) {
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application introuvable: " + appId));
 
        AdvancedRule rule = AdvancedRule.builder()
                .app(app)
                .name(req.getName())
                .description(req.getDescription())
                .triggerEvents(req.getTriggerEvents())
                .conditionLogic(req.getConditionLogic() != null ? req.getConditionLogic() : "AND")
                .conditions(mapConditions(req.getConditions()))
                .actions(mapActions(req.getActions()))
                .priority(req.getPriority() != null ? req.getPriority() : 0)
                .cooldownMinutes(req.getCooldownMinutes())
                .maxAwardsPerUser(req.getMaxAwardsPerUser())
                .build();
 
        AdvancedRule saved = ruleRepository.save(rule);
        log.info("[AdvRuleService] Règle créée #{} '{}' pour app#{}", saved.getId(), saved.getName(), appId);
        return toResponse(saved);
    }
 
    public List<RuleResponse> getRulesByAppId(Long appId) {
        return ruleRepository.findByAppIdOrderByPriorityDesc(appId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    @Transactional
    public RuleResponse toggleRule(Long ruleId, Boolean active) {
        AdvancedRule rule = ruleRepository.findById(ruleId)
                .orElseThrow(() -> new RuntimeException("Règle introuvable: " + ruleId));
        rule.setActive(active);
        return toResponse(ruleRepository.save(rule));
    }
 
    @Transactional
    public void deleteRule(Long ruleId) {
        ruleRepository.deleteById(ruleId);
        log.info("[AdvRuleService] Règle #{} supprimée", ruleId);
    }
 
    // ── Mapping ───────────────────────────────────────────────────────────────
 
    private List<AdvancedRule.AdvancedCondition> mapConditions(
            List<CreateAdvancedRuleRequest.ConditionDto> dtos) {
        if (dtos == null) return List.of();
        return dtos.stream().map(d -> AdvancedRule.AdvancedCondition.builder()
                .type(d.getType())
                .field(d.getField())
                .operator(d.getOperator())
                .value(d.getValue())
                .build()).collect(Collectors.toList());
    }
 
    private List<AdvancedRule.AdvancedAction> mapActions(
            List<CreateAdvancedRuleRequest.ActionDto> dtos) {
        if (dtos == null) return List.of();
        return dtos.stream().map(d -> AdvancedRule.AdvancedAction.builder()
                .type(d.getType())
                .value(d.getValue())
                .description(d.getDescription())
                .params(d.getParams())
                .build()).collect(Collectors.toList());
    }
 
    private RuleResponse toResponse(AdvancedRule r) {
        return RuleResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .description(r.getDescription())
                .triggerEvents(r.getTriggerEvents())
                .conditions(r.getConditions() == null ? List.of() :
                    r.getConditions().stream().map(c -> Map.<String,Object>of(
                        "type",     c.getType()     != null ? c.getType()     : "",
                        "field",    c.getField()    != null ? c.getField()    : "",
                        "operator", c.getOperator() != null ? c.getOperator() : "",
                        "value",    c.getValue()    != null ? c.getValue()    : ""
                    )).collect(Collectors.toList()))
                .actions(r.getActions() == null ? List.of() :
                    r.getActions().stream().map(a -> Map.<String,Object>of(
                        "type",        a.getType()        != null ? a.getType()        : "",
                        "value",       a.getValue()       != null ? a.getValue()       : "",
                        "description", a.getDescription() != null ? a.getDescription() : ""
                    )).collect(Collectors.toList()))
                .priority(r.getPriority())
                .active(r.getActive())
                .createdAt(r.getCreatedAt())
                .build();
    }
}