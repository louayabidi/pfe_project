package com.gamification.backend.service;

import com.gamification.backend.dto.event.TrackEventRequest;
import com.gamification.backend.model.AdvancedRule;
import com.gamification.backend.model.AdvancedRule.AdvancedAction;
import com.gamification.backend.model.AdvancedRule.AdvancedCondition;
import com.gamification.backend.model.App;
import com.gamification.backend.model.PointsBalance;
import com.gamification.backend.model.RuleTriggerHistory;
import com.gamification.backend.model.UserBadge;
import com.gamification.backend.repository.AdvancedRuleRepository;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.IncomingEventRepository;
import com.gamification.backend.repository.PointsRepository;
import com.gamification.backend.repository.RuleTriggerHistoryRepository;
import com.gamification.backend.repository.UserBadgeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdvancedRuleEvaluationService {

    private final AdvancedRuleRepository       ruleRepository;
    private final RuleTriggerHistoryRepository historyRepository;
    private final PointsRepository             pointsRepository;
    private final BadgeService                 badgeService;
    private final UserBadgeRepository userBadgeRepository;
    private final IncomingEventRepository incomingEventRepository;
    private final AppRepository appRepository;

    // ── API publique ──────────────────────────────────────────────────────────

    public List<AdvancedRule> evaluateRulesForEvent(Long appId, TrackEventRequest event) {

        //kuste simple log pour faire une verification baad fasakh 
        log.info("[AdvRule] Looking for rules: appId={} event='{}'", appId, event.getEventName());
        log.info("[AdvRule] event='{}' user='{}'", event.getEventName(), event.getUserId());
        List<AdvancedRule> candidates =
                ruleRepository.findActiveRulesByEvent(appId, event.getEventName());
        log.debug("[AdvRule] {} candidat(s)", candidates.size());
        return candidates.stream()
                .filter(r -> evaluateConditions(r, event))
                .filter(r -> checkCooldown(r, event.getUserId()))
                .filter(r -> checkMaxAwards(r, event.getUserId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public List<Map<String, Object>> executeRuleActions(
            AdvancedRule rule, String userId, Long appId) {
        log.info("[AdvRule] {} action(s) règle#{} user='{}'",
                rule.getActions().size(), rule.getId(), userId);
        List<Map<String, Object>> rewards = new ArrayList<>();
        for (AdvancedAction action : rule.getActions()) {
            try {
                Map<String, Object> r = executeAction(action, userId, appId);
                if (r != null) rewards.add(r);
            } catch (Exception e) {
                log.error("[AdvRule] Erreur règle#{}: {}", rule.getId(), e.getMessage(), e);
            }
        }
        historyRepository.save(RuleTriggerHistory.builder()
                .ruleId(rule.getId()).appId(appId).userId(userId).build());
        rule.setTriggerCount((rule.getTriggerCount() != null ? rule.getTriggerCount() : 0L) + 1);
        rule.setLastTriggeredAt(LocalDateTime.now());
        ruleRepository.save(rule);
        return rewards;
    }

    // ── Évaluation des conditions ─────────────────────────────────────────────

    private boolean evaluateConditions(AdvancedRule rule, TrackEventRequest event) {
        List<AdvancedCondition> conds = rule.getConditions();

        //fasakh baad
         log.info("[AdvRule] rule#{} conditions count: {}", rule.getId(),
             conds == null ? "NULL" : conds.size());
        if (conds == null || conds.isEmpty()) return true;
        List<Boolean> results = conds.stream()
                .map(c -> evaluateCondition(c, event, rule))
                .collect(Collectors.toList());
        return "OR".equalsIgnoreCase(rule.getConditionLogic())
                ? results.stream().anyMatch(b -> b)
                : results.stream().allMatch(b -> b);
    }

    private boolean evaluateCondition(
            AdvancedCondition c, TrackEventRequest event, AdvancedRule rule) {
        if (c.getType() == null) return false;
        return switch (c.getType().toUpperCase()) {
            case "EVENT"       -> event.getEventName().equals(c.getField());
            case "EVENT_COUNT" -> evaluateEventCount(c, event, rule);
            case "TIME_PERIOD" -> evaluateTimePeriod(c);
            case "DATA_FIELD"  -> evaluateDataField(c, event);
            default -> { log.warn("Type inconnu: {}", c.getType()); yield false; }
        };
    }

    /** CAS 3 — N déclenchements de la règle pour cet utilisateur */

private boolean evaluateEventCount(
        AdvancedCondition c, TrackEventRequest event, AdvancedRule rule) {

    long count = incomingEventRepository.countByAppIdAndUserIdAndEventName(
            rule.getApp().getId(),
            event.getUserId(),
            event.getEventName()
    );

    long threshold = (long) toDouble(c.getValue());
    if (threshold <= 0) return false;

    String op = c.getOperator() != null ? c.getOperator().toUpperCase() : "GREATER_THAN";

    boolean ok = switch (op) {
        // Cycle mode: fires at every multiple of threshold (10, 20, 30...)
        case "MULTIPLE_OF" -> count % threshold == 0 && count > 0;

        // One-shot mode: fires once when count exceeds threshold  
        case "GREATER_THAN"          -> count > threshold;
        case "GREATER_THAN_OR_EQUAL" -> count >= threshold;
        case "EQUALS"                -> count == threshold;
        case "LESS_THAN"             -> count < threshold;
        case "LESS_THAN_OR_EQUAL"    -> count <= threshold;
        default                      -> count > threshold;
    };

    log.info("[AdvRule] EVENT_COUNT eventName='{}' user='{}' count={} op={} val={} → {}",
            event.getEventName(), event.getUserId(), count, op, threshold, ok);
    return ok;
}
private double toDouble(Object o) {
    try { return Double.parseDouble(String.valueOf(o)); }
    catch (NumberFormatException e) { return 0.0; }
}

    /** CAS 4 — Dans une fenêtre temporelle */
    private boolean evaluateTimePeriod(AdvancedCondition c) {
        if (c.getValue() == null) return true;
        LocalDateTime threshold = switch (c.getValue().toString().toUpperCase()) {
            case "1_HOUR"  -> LocalDateTime.now().minus(1,  ChronoUnit.HOURS);
            case "1_DAY"   -> LocalDateTime.now().minus(1,  ChronoUnit.DAYS);
            case "7_DAYS"  -> LocalDateTime.now().minus(7,  ChronoUnit.DAYS);
            case "30_DAYS" -> LocalDateTime.now().minus(30, ChronoUnit.DAYS);
            default        -> LocalDateTime.MIN;
        };
        return LocalDateTime.now().isAfter(threshold);
    }

    /** CAS 5 — Valeur d'un champ data satisfait une comparaison */
    private boolean evaluateDataField(AdvancedCondition c, TrackEventRequest event) {
        if (event.getData() == null) return false;
        Object val = event.getData().get(c.getField());
        if (val == null) return false;
        return c.evaluate(val);
    }

    // ── Guards ────────────────────────────────────────────────────────────────

    /** CAS 6 — Cooldown : délai minimum entre deux déclenchements */
    private boolean checkCooldown(AdvancedRule rule, String userId) {
        if (rule.getCooldownMinutes() == null || rule.getCooldownMinutes() <= 0) return true;
        return historyRepository.findLastTrigger(rule.getId(), userId)
                .map(last -> LocalDateTime.now().isAfter(
                        last.getTriggeredAt().plus(rule.getCooldownMinutes(), ChronoUnit.MINUTES)))
                .orElse(true);
    }

    /** CAS 7 — Limite du nombre total d'awards par utilisateur */
    private boolean checkMaxAwards(AdvancedRule rule, String userId) {
        if (rule.getMaxAwardsPerUser() == null) return true;
        long count = historyRepository.countByRuleIdAndUserId(rule.getId(), userId);
        return count < rule.getMaxAwardsPerUser();
    }

    // ── Exécution des actions ─────────────────────────────────────────────────

    private Map<String, Object> executeAction(
            AdvancedAction action, String userId, Long appId) {
        if (action.getType() == null) return null;
        return switch (action.getType().toUpperCase()) {
            case "POINTS"     -> executePoints(action, userId, appId);
            case "BADGE"      -> executeBadge(action, userId);
            case "MULTIPLIER" -> executeMultiplier(action);
            case "CUSTOM"     -> executeCustom(action);
            default -> { log.warn("Action inconnue: {}", action.getType()); yield null; }
        };
    }

   private Map<String, Object> executePoints(AdvancedAction a, String userId, Long appId) {
    int pts = Integer.parseInt(a.getValue().toString());
    
    // Fetch the App entity
    App app = appRepository.findById(appId)
            .orElseThrow(() -> new RuntimeException("App not found with id: " + appId));
    
    PointsBalance bal = pointsRepository.findByUserIdAndAppId(userId, appId)
            .orElseGet(() -> PointsBalance.builder()
                    .userId(userId)
                    .app(app)  // Now 'app' is defined
                    .balance(0)
                    .lifetimeEarned(0)
                    .build());
    
    bal.setBalance(bal.getBalance() + pts);
    bal.setLifetimeEarned(bal.getLifetimeEarned() + pts);
    pointsRepository.save(bal);
    
    log.info("[AdvRule] +{} points → user='{}' nouveau solde={}", pts, userId, bal.getBalance());
    
    Map<String, Object> r = new LinkedHashMap<>();
    r.put("type", "POINTS");
    r.put("value", pts);
    r.put("newBalance", bal.getBalance());
    r.put("description", a.getDescription() != null ? a.getDescription() : "+"+pts+" points");
    return r;
}

private Map<String, Object> executeBadge(AdvancedAction a, String userId) {
    Long badgeId = Long.parseLong(a.getValue().toString());
    try { badgeService.getBadge(badgeId); }
    catch (RuntimeException e) { log.warn("Badge #{} introuvable", badgeId); return null; }

boolean already = userBadgeRepository.existsByUserIdAndBadgeId(userId, badgeId);
    if (already) {
        log.info("[AdvRule] Badge #{} déjà attribué à '{}'", badgeId, userId);
        return null;
    }
    userBadgeRepository.save(UserBadge.builder()
            .userId(userId).badgeId(badgeId).build());

    Map<String, Object> r = new LinkedHashMap<>();
    r.put("type", "BADGE");
    r.put("value", badgeId);
    r.put("description", a.getDescription() != null ? a.getDescription() : "Badge #" + badgeId + " débloqué");
    return r;
}

    private Map<String, Object> executeMultiplier(AdvancedAction a) {
        double mult = Double.parseDouble(a.getValue().toString());
       
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("type", "MULTIPLIER"); r.put("value", mult);
        r.put("description", String.format("Points x%.1f", mult));
        return r;
    }

    private Map<String, Object> executeCustom(AdvancedAction a) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("type", "CUSTOM"); r.put("params", a.getParams());
        r.put("description", a.getDescription());
        return r;
    }
}