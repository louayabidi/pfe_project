package com.gamification.backend.controller;

import com.gamification.backend.dto.badge.BadgeResponse;
import com.gamification.backend.dto.badge.CreateBadgeRequest;
import com.gamification.backend.service.AppService;
import com.gamification.backend.service.BadgeService;
import com.gamification.backend.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {
    
    private final BadgeService badgeService;
    private final AppService appService;
    private final JwtService jwtService;
    
    private Long getAppIdFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String email = jwtService.extractEmail(token);
            return appService.getCurrentAppId(email);
        }
        throw new RuntimeException("Token invalide");
    }
    
    @PostMapping
    public ResponseEntity<BadgeResponse> createBadge(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateBadgeRequest request) {
        Long appId = getAppIdFromToken(token);
        return new ResponseEntity<>(badgeService.createBadge(appId, request), HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getBadges(
            @RequestHeader("Authorization") String token) {
        Long appId = getAppIdFromToken(token);
        return ResponseEntity.ok(badgeService.getBadgesByAppId(appId));
    }
    
    @GetMapping("/{badgeId}")
    public ResponseEntity<BadgeResponse> getBadge(
            @RequestHeader("Authorization") String token,
            @PathVariable Long badgeId) {
        return ResponseEntity.ok(badgeService.getBadge(badgeId));
    }
    
    @DeleteMapping("/{badgeId}")
    public ResponseEntity<Void> deleteBadge(
            @RequestHeader("Authorization") String token,
            @PathVariable Long badgeId) {
        badgeService.deleteBadge(badgeId);
        return ResponseEntity.noContent().build();
    }
}