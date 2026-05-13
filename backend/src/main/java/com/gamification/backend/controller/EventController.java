package com.gamification.backend.controller;
import com.gamification.backend.model.AdvancedRule;
import com.gamification.backend.service.AdvancedRuleEvaluationService;
import java.util.Map;
import com.gamification.backend.dto.event.RewardResponse;
import com.gamification.backend.dto.event.TrackEventRequest;
import com.gamification.backend.model.App;
import com.gamification.backend.model.IncomingEvent;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.IncomingEventRepository;
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
   private final IncomingEventRepository incomingEventRepository;
@PostMapping("/track")
public ResponseEntity<Map<String, Object>> trackEvent(
        @RequestHeader("X-API-Key") String apiKey,
        @Valid @RequestBody TrackEventRequest request) {

    log.info("Réception d'un événement: {} pour l'utilisateur {}",
             request.getEventName(), request.getUserId());

    App app = appRepository.findByApiKey(apiKey)
            .orElseThrow(() -> new RuntimeException("Clé API invalide"));

    eventService.saveEvent(app, request);

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

    log.info("{} récompenses générées pour l'événement {}", rewards.size(), request.getEventName());

    // ✅ Wrap in object so Flutter can do response['rewards']
    return ResponseEntity.ok(Map.of("rewards", rewards));
}

@GetMapping("/names")
public ResponseEntity<List<String>> getEventNames(@RequestParam Long appId) {
    // 1. On récupère l'app (getAppById vérifie déjà normalement que l'owner est le bon)
    // Sinon, assure-tu que ton service filtre par l'utilisateur connecté via le JWT
    log.info("Fetching events for appId: {}", appId);
    
    return ResponseEntity.ok(incomingEventRepository.findDistinctEventNamesByAppId(appId));
}

}