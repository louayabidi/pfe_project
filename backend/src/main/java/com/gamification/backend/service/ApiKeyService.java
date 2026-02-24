// src/main/java/com/gamification/backend/service/ApiKeyService.java
package com.gamification.backend.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class ApiKeyService {
    
    private final SecureRandom secureRandom = new SecureRandom();
    
    public String generateApiKey() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return "gam_" + Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}