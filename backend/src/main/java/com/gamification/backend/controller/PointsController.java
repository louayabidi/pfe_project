package com.gamification.backend.controller;

import com.gamification.backend.dto.points_transaction.PointsResponse;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.service.PointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class PointsController {

    private final PointsService pointsService;
    private final AppRepository appRepository;

    // Appelé par le SDK Flutter avec X-API-Key
    @GetMapping("/{userId}/points")
    public ResponseEntity<PointsResponse> getUserPoints(
            @PathVariable String userId,
            @RequestHeader("X-API-Key") String apiKey) {

        // Trouver l'app via la clé API
        Long appId = appRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("Clé API invalide"))
                .getId();

        return ResponseEntity.ok(pointsService.getUserPoints(userId, appId));
    }
}