package com.gamification.backend.controller;

import com.gamification.backend.dto.rule.CreateRuleRequest;
import com.gamification.backend.dto.rule.RuleResponse;
import com.gamification.backend.service.AppService;
import com.gamification.backend.service.JwtService;
import com.gamification.backend.service.RuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class RuleController {
    
    private final RuleService ruleService;
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
    public ResponseEntity<RuleResponse> createRule(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody CreateRuleRequest request) {
        Long appId = getAppIdFromToken(token);
        return new ResponseEntity<>(ruleService.createRule(appId, request), HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<List<RuleResponse>> getRules(
            @RequestHeader("Authorization") String token) {
        Long appId = getAppIdFromToken(token);
        return ResponseEntity.ok(ruleService.getRulesByAppId(appId));
    }
    
    @PatchMapping("/{ruleId}/toggle")
    public ResponseEntity<RuleResponse> toggleRule(
            @RequestHeader("Authorization") String token,
            @PathVariable Long ruleId,
            @RequestBody Map<String, Boolean> payload) {
        Boolean active = payload.get("active");
        if (active == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(ruleService.toggleRule(ruleId, active));
    }
    
    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> deleteRule(
            @RequestHeader("Authorization") String token,
            @PathVariable Long ruleId) {
        ruleService.deleteRule(ruleId);
        return ResponseEntity.noContent().build();
    }
}