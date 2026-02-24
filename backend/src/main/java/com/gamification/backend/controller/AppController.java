// src/main/java/com/gamification/backend/controller/AppController.java
package com.gamification.backend.controller;

import com.gamification.backend.dto.app.AppResponse;
import com.gamification.backend.dto.app.CreateAppRequest;
import com.gamification.backend.service.AppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
}
    
    @GetMapping
    public ResponseEntity<List<AppResponse>> getMyApps() {
        return ResponseEntity.ok(appService.getMyApps());
    }
}