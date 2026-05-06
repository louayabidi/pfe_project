package com.gamification.backend.controller;

import com.gamification.backend.dto.points_transaction.PointsResponse;
import com.gamification.backend.dto.user.UserProfileResponse;
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

    @GetMapping("/{userId}/points")
    public ResponseEntity<PointsResponse> getUserPoints(
            @PathVariable String userId,
            @RequestHeader("X-API-Key") String apiKey) {

        Long appId = appRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("Clé API invalide"))
                .getId();

        return ResponseEntity.ok(pointsService.getUserPoints(userId, appId));
    }

    // ← old mapping kept for backwards compat
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable String userId,
            @RequestHeader("X-API-Key") String apiKey) {

        Long appId = appRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("Clé API invalide"))
                .getId();

        return ResponseEntity.ok(pointsService.getUserProfile(userId, appId));
    }

    // ✅ This is what the Flutter SDK calls
    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileResponse> getUserProfileByPath(
            @PathVariable String userId,
            @RequestHeader("X-API-Key") String apiKey) {

        Long appId = appRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("Clé API invalide"))
                .getId();

        return ResponseEntity.ok(pointsService.getUserProfile(userId, appId));
    }
}