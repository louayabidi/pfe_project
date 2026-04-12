package com.gamification.backend.controller;
 
import com.gamification.backend.dto.rule.CreateAdvancedRuleRequest;
import com.gamification.backend.dto.rule.RuleResponse;
import com.gamification.backend.service.AdvancedRuleService;
import com.gamification.backend.service.AppService;
import com.gamification.backend.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/rules/advanced")
@RequiredArgsConstructor
public class AdvancedRuleController {
 
    private final AdvancedRuleService advancedRuleService;
    private final AppService          appService;
    private final JwtService          jwtService;
 
    private String extractEmail(String token) {
        if (token != null && token.startsWith("Bearer "))
            return jwtService.extractEmail(token.substring(7));
        throw new RuntimeException("Token invalide");
    }
 
    @PostMapping
    public ResponseEntity<RuleResponse> create(
            @RequestHeader("Authorization") String token,
            @RequestParam Long appId,
            @Valid @RequestBody CreateAdvancedRuleRequest req) {
        appService.verifyOwnership(extractEmail(token), appId);
        return new ResponseEntity<>(advancedRuleService.createRule(appId, req), HttpStatus.CREATED);
    }
 
    @GetMapping
    public ResponseEntity<List<RuleResponse>> getAll(
            @RequestHeader("Authorization") String token,
            @RequestParam Long appId) {
        appService.verifyOwnership(extractEmail(token), appId);
        return ResponseEntity.ok(advancedRuleService.getRulesByAppId(appId));
    }
 
    @PatchMapping("/{ruleId}/toggle")
    public ResponseEntity<RuleResponse> toggle(
            @RequestHeader("Authorization") String token,
            @RequestParam Long appId,
            @PathVariable Long ruleId,
            @RequestBody Map<String, Boolean> payload) {
        appService.verifyOwnership(extractEmail(token), appId);
        Boolean active = payload.get("active");
        if (active == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(advancedRuleService.toggleRule(ruleId, active));
    }
 
    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> delete(
            @RequestHeader("Authorization") String token,
            @RequestParam Long appId,
            @PathVariable Long ruleId) {
        appService.verifyOwnership(extractEmail(token), appId);
        advancedRuleService.deleteRule(ruleId);
        return ResponseEntity.noContent().build();
    }
}