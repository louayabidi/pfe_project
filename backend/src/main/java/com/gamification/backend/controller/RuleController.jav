// src/main/java/com/gamification/backend/controller/RuleController.java
@PostMapping
public ResponseEntity<?> createRule(
        @RequestHeader("Authorization") String token,
        @Valid @RequestBody CreateRuleRequest request) {
    
    // Exemple de règle : SI "USER_SIGNUP" ALORS badge "Bienvenue" + 50 points
    Rule rule = Rule.builder()
            .name(request.getName())
            .triggerEvent(request.getEventName())  // "USER_SIGNUP"
            .conditions(request.getConditions())   // ex: { "field": "plan", "value": "premium" }
            .actions(request.getActions())         // ex: [{ "type": "badge", "id": 1 }, { "type": "points", "amount": 50 }]
            .build();
    
    return ResponseEntity.ok(ruleService.createRule(rule));
}