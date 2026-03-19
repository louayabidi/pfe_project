package com.gamification.backend.controller;

import com.gamification.backend.dto.event.RegisterEventsRequest;
import com.gamification.backend.service.AppService;
import com.gamification.backend.service.EventService;
import com.gamification.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventRegistrationController {

    private final EventService eventService;
    private final AppService appService;
    private final JwtService jwtService;

    // Appelé par le SCANNER (avec API Key)
    @PostMapping("/register")
    public ResponseEntity<Void> registerEvents(
            @RequestHeader("X-Api-Key") String apiKey,
            @RequestBody RegisterEventsRequest request) {
        eventService.registerEvents(apiKey, request.getEvents());
        return ResponseEntity.ok().build();
    }

    // Appelé par le DASHBOARD (avec JWT token)
@GetMapping("/registered")
public ResponseEntity<List<String>> getRegisteredEvents(
        @RequestHeader("Authorization") String token,
        @RequestParam Long appId) {  // ← ajouter ce paramètre
    
    // Vérifier que l'app appartient bien au user connecté
    String email = extractEmail(token);
    appService.verifyOwnership(email, appId);  // ← sécurité
    
    return ResponseEntity.ok(eventService.getRegisteredEvents(appId));
}

private String extractEmail(String token) {
    if (token != null && token.startsWith("Bearer ")) {
        return jwtService.extractEmail(token.substring(7));
    }
    throw new RuntimeException("Token invalide");
}
}