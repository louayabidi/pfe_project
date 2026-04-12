package com.gamification.backend.controller;

import com.gamification.backend.dto.profile.ChangePasswordRequest;
import com.gamification.backend.dto.profile.ProfileResponse;
import com.gamification.backend.dto.profile.UpdateProfileRequest;
import com.gamification.backend.service.JwtService;
import com.gamification.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;
    private final JwtService     jwtService;

    private String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer "))
            return jwtService.extractEmail(token.substring(7));
        throw new RuntimeException("Token invalide");
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(
            @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(profileService.getProfile(extractEmail(token)));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(profileService.updateProfile(extractEmail(token), req));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ChangePasswordRequest req) {
        profileService.changePassword(extractEmail(token), req);
        return ResponseEntity.noContent().build();
    }
}