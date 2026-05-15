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
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;
    private final AppService appService;
    private final JwtService jwtService;

    private String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return jwtService.extractEmail(token.substring(7));
        }
        throw new RuntimeException("Token invalide");
    }

    @PostMapping
    public ResponseEntity<BadgeResponse> createBadge(
            @RequestHeader("Authorization") String token,
            @RequestParam Long appId,                          // ✅ explicit appId
            @Valid @RequestBody CreateBadgeRequest request) {
        appService.verifyOwnership(extractEmail(token), appId); // ✅ security check
        return new ResponseEntity<>(badgeService.createBadge(appId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BadgeResponse>> getBadges(
            @RequestHeader("Authorization") String token,
            @RequestParam Long appId) {                        // ✅ explicit appId
        appService.verifyOwnership(extractEmail(token), appId);
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
            @RequestParam Long appId,
            @PathVariable Long badgeId) {
        appService.verifyOwnership(extractEmail(token), appId);
        badgeService.deleteBadge(badgeId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-image")
public ResponseEntity<Map<String, String>> uploadImage(
        @RequestHeader("Authorization") String token,
        @RequestParam("file") MultipartFile file) {

    extractEmail(token); // validates token is present and valid

    String url = badgeService.uploadImage(file);
    return ResponseEntity.ok(Map.of("url", url));
}
}