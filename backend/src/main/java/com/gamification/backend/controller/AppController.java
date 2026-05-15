package com.gamification.backend.controller;

import com.gamification.backend.dto.app.CreateAppRequest;
import com.gamification.backend.service.AppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/apps")
@RequiredArgsConstructor
public class AppController {

    private final AppService appService;

    @PostMapping
    public ResponseEntity<?> createApp(@Valid @RequestBody CreateAppRequest request) {
        try {
            return new ResponseEntity<>(appService.createApp(request), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyApps() {
        try {
            return ResponseEntity.ok(appService.getMyApps());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appService.getAppById(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
public ResponseEntity<?> updateApp(
        @PathVariable Long id,
        @Valid @RequestBody CreateAppRequest request) {
    try {
        return ResponseEntity.ok(appService.updateApp(id, request));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (SecurityException e) {
        return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
}

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteApp(@PathVariable Long id) {
        try {
            appService.deleteApp(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/regenerate-key")
    public ResponseEntity<?> regenerateApiKey(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appService.regenerateApiKey(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}