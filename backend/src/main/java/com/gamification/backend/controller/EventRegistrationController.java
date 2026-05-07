package com.gamification.backend.controller;

import com.gamification.backend.dto.event.EventFilterRequest;
import com.gamification.backend.dto.event.IncomingEventDTO;
import com.gamification.backend.dto.event.RegisterEventsRequest;
import com.gamification.backend.service.AppService;
import com.gamification.backend.service.EventService;
import com.gamification.backend.service.JwtService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;           
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


@GetMapping("/incoming")
public ResponseEntity<Page<IncomingEventDTO>> getIncomingEvents(
        @RequestHeader("Authorization") String token,
        @RequestParam Long appId,
        @ModelAttribute EventFilterRequest filter) {

    String email = extractEmail(token);
    appService.verifyOwnership(email, appId);
    filter.setPage(Math.max(0, filter.getPage()));
    filter.setSize(Math.min(100, Math.max(1, filter.getSize())));

    return ResponseEntity.ok(eventService.getIncomingEvents(appId, filter));
}

@GetMapping("/incoming/users")
public ResponseEntity<List<String>> getDistinctUsers(
        @RequestHeader("Authorization") String token,
        @RequestParam Long appId) {

    String email = extractEmail(token);
    appService.verifyOwnership(email, appId);
    return ResponseEntity.ok(eventService.getDistinctUsers(appId));
}

@GetMapping("/incoming/event-names")
public ResponseEntity<List<String>> getDistinctEventNames(
        @RequestHeader("Authorization") String token,
        @RequestParam Long appId) {

    String email = extractEmail(token);
    appService.verifyOwnership(email, appId);
    return ResponseEntity.ok(eventService.getDistinctEventNames(appId));
}


@GetMapping("/incoming/display-names")
public ResponseEntity<List<String>> getDistinctDisplayNames(
        @RequestHeader("Authorization") String token,
        @RequestParam Long appId) {

    String email = extractEmail(token);
    appService.verifyOwnership(email, appId);
    return ResponseEntity.ok(eventService.getDistinctDisplayNames(appId));
}

}