package com.gamification.backend.controller;
 
import com.gamification.backend.dto.gamifpage.*;
import com.gamification.backend.service.GamifPageConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/api/gamif-page")
@RequiredArgsConstructor
public class GamifPageController {
 
    private final GamifPageConfigService service;
 
    // ── Dashboard (authenticated) ─────────────────────────────────────────────
 
    @PostMapping("/{appId}")
    public ResponseEntity<GamifPageConfigResponse> save(
            @PathVariable Long appId,
            @RequestBody GamifPageConfigRequest req) {
        return ResponseEntity.ok(service.save(appId, req));
    }
 
    @GetMapping("/{appId}")
    public ResponseEntity<List<GamifPageConfigResponse>> list(@PathVariable Long appId) {
        return ResponseEntity.ok(service.listForApp(appId));
    }
 
    @DeleteMapping("/config/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
 
    // ── SDK public endpoints (no auth) ────────────────────────────────────────
 
    /** Flutter SDK: fetch page config */
    @GetMapping("/public/{publishableKey}")
    public ResponseEntity<GamifPageConfigResponse> getPublic(
            @PathVariable String publishableKey) {
        return ResponseEntity.ok(service.getPublic(publishableKey));
    }
 
    /** Flutter SDK: fetch leaderboard (top N + user rank) */
    @GetMapping("/public/{publishableKey}/leaderboard")
    public ResponseEntity<LeaderboardPublicDTO> getLeaderboard(
            @PathVariable String publishableKey,
            @RequestParam(required = false) String userId) {
        return ResponseEntity.ok(service.getLeaderboard(publishableKey, userId));
    }
}