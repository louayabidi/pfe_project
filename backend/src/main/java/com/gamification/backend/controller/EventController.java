package com.gamification.backend.controller;

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
    
    @PostMapping("/track")
    public ResponseEntity<List<RewardResponse>> trackEvent(
            @RequestHeader("X-API-Key") String apiKey,
            @Valid @RequestBody TrackEventRequest request) {
        
        log.info("Réception d'un événement: {} pour l'utilisateur {}", 
                 request.getEventName(), request.getUserId());
        
        // 1. Valider la clé API et trouver l'application
        App app = appRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("Clé API invalide"));
        
        // 2. Sauvegarder l'événement
        eventService.saveEvent(app, request);
        
        // 3. Créer l'objet événement pour l'évaluation
        IncomingEvent event = IncomingEvent.builder()
                .app(app)
                .userId(request.getUserId())
                .eventName(request.getEventName())
                .eventData(request.getData())
                .build();
        
        // 4. Évaluer les règles et obtenir les récompenses
        List<RewardResponse> rewards = ruleEngineService.evaluateEvent(event);
        
        log.info("{} récompenses générées pour l'événement {}", rewards.size(), request.getEventName());
        
        // 5. Retourner les récompenses
        return ResponseEntity.ok(rewards);
    }
}