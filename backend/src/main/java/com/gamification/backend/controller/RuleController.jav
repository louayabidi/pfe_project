@PostMapping
public ResponseEntity<RuleResponse> createRule(
        @RequestHeader("Authorization") String token,
        @RequestParam Long appId,
        @Valid @RequestBody CreateRuleRequest request) {
    
    log.info("=== createRule appelé avec appId={} ===", appId); 
    String email = extractEmail(token);
    appService.verifyOwnership(email, appId);
    return new ResponseEntity<>(ruleService.createRule(appId, request), HttpStatus.CREATED);
}

@GetMapping
public ResponseEntity<List<RuleResponse>> getRules(
        @RequestHeader("Authorization") String token,
        @RequestParam Long appId) {                  // ← ajouter
    String email = extractEmail(token);
    appService.verifyOwnership(email, appId);
    return ResponseEntity.ok(ruleService.getRulesByAppId(appId));
}

// ← Remplacer getAppIdFromToken() par extractEmail()
private String extractEmail(String token) {
    if (token != null && token.startsWith("Bearer ")) {
        return jwtService.extractEmail(token.substring(7));
    }
    throw new RuntimeException("Token invalide");
}