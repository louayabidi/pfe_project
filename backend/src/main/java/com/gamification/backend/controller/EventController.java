package com.gamification.backend.controller;
import com.gamification.backend.model.AdvancedRule;
import com.gamification.backend.service.AdvancedRuleEvaluationService;
import java.util.Map;
import com.gamification.backend.dto.event.RewardResponse;
import com.gamification.backend.dto.event.TrackEventRequest;
import com.gamification.backend.model.App;
import com.gamification.backend.model.IncomingEvent;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.service.EventService;
import com.gamification.backend.service.RuleEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {
    
    private final AppRepository appRepository;
    private final EventService eventService;
    private final RuleEngineService ruleEngineService;
    private final AdvancedRuleEvaluationService advancedRuleEvaluationService; 

 @PostMapping("/track")
public ResponseEntity<List<RewardResponse>> trackEvent(
        @RequestHeader("X-API-Key") String apiKey,
        @Valid @RequestBody TrackEventRequest request) {

    App app = appRepository.findByApiKey(apiKey)
            .orElseThrow(() -> new RuntimeException("Clé API invalide"));

    // ✅ Step 1: Evaluate BEFORE saving (so counts are accurate)
    IncomingEvent event = IncomingEvent.builder()
            .app(app)
            .userId(request.getUserId())
            .eventName(request.getEventName())
            .eventData(request.getData())
            .build();

    List<RewardResponse> rewards = ruleEngineService.evaluateEvent(event);

    List<AdvancedRule> matchingAdvancedRules = advancedRuleEvaluationService
            .evaluateRulesForEvent(app.getId(), request);

    for (AdvancedRule rule : matchingAdvancedRules) {
        List<Map<String, Object>> advancedRewards = advancedRuleEvaluationService
                .executeRuleActions(rule, request.getUserId(), app.getId());
        advancedRewards.forEach(r -> rewards.add(
            RewardResponse.builder()
                .type((String) r.get("type"))
                .data(r.get("value"))
                .message((String) r.get("description"))
                .build()
        ));
    }

    // ✅ Step 2: Save AFTER rules run
    eventService.saveEvent(app, request);

    return ResponseEntity.ok(rewards);
}
}