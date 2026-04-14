package com.gamification.backend.controller;

import com.gamification.backend.dto.widget.WidgetConfigRequest;
import com.gamification.backend.dto.widget.WidgetConfigResponse;
import com.gamification.backend.model.App;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.service.WidgetConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/widgets")
@RequiredArgsConstructor
public class WidgetConfigController {

    private final WidgetConfigService widgetConfigService;
    private final AppRepository appRepository;

    @GetMapping("/config/{appId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<WidgetConfigResponse>> getAppConfigs(
            @PathVariable Long appId,
            Principal principal) {

        verifyOwnership(appId, principal.getName());
        return ResponseEntity.ok(widgetConfigService.getAppConfigs(appId));
    }

    @PostMapping("/config/{appId}")
    @Transactional
    public ResponseEntity<WidgetConfigResponse> saveConfig(
            @PathVariable Long appId,
            @RequestBody WidgetConfigRequest request,
            Principal principal) {

        verifyOwnership(appId, principal.getName());
        return ResponseEntity.ok(widgetConfigService.createOrUpdateConfig(appId, request));
    }

    // Public endpoint for Flutter SDK — no auth needed
    @GetMapping("/public/{publishableKey}")
    public ResponseEntity<WidgetConfigResponse> getPublicConfig(
            @PathVariable String publishableKey) {
        return ResponseEntity.ok(widgetConfigService.getConfig(publishableKey));
    }

    /**
     * Verifies ownership with optimized eager loading query.
     * Uses findByIdWithOwner() to load AppOwner in a single JOIN FETCH query.
     */
    private void verifyOwnership(Long appId, String email) {
        // ✅ IMPORTANT: Use the optimized method that eagerly loads the owner
        App app = appRepository.findByIdWithOwner(appId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "App not found"));

        // ✅ Safe to access owner.email - it's already loaded in memory, no lazy loading needed
        if (!app.getOwner().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}