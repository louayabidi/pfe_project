package com.gamification.backend.controller;

import com.gamification.backend.dto.RegisterRequest;
import com.gamification.backend.model.AppOwner;
import com.gamification.backend.repository.AppOwnerRepository;
import com.gamification.backend.dto.LoginRequest;
import com.gamification.backend.dto.AuthResponse;
import com.gamification.backend.exception.AccountLockedException;
import com.gamification.backend.exception.WeakPasswordException;
import com.gamification.backend.service.AuthService;
import com.gamification.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    private final JwtService jwtService;                   
    private final AppOwnerRepository ownerRepository;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (WeakPasswordException e) {
            return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Password too weak",
                e.getRequirement()
            );
        } catch (RuntimeException e) {
            return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "Registration failed",
                e.getMessage()
            );
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (AccountLockedException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Account locked");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("remainingSeconds", e.getRemainingLockoutSeconds());
            errorResponse.put("remainingMinutes", Math.ceil(e.getRemainingLockoutSeconds() / 60.0));
            
            log.warn("Login attempt on locked account: {}", request.getEmail());
            return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
        } catch (RuntimeException e) {
            return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Login failed",
                e.getMessage()
            );
        }
    }
    
    @GetMapping("/test")
    public String test() {
        return "✅ API Auth fonctionne !";
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return buildErrorResponse(
                    HttpStatus.UNAUTHORIZED,
                    "Unauthorized",
                    "Missing or invalid token"
                );
            }
            
            String token = authHeader.substring(7);
            String email = jwtService.extractEmail(token);
            AppOwner owner = ownerRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(AuthResponse.builder()
                    .id(owner.getId())
                    .email(owner.getEmail())
                    .fullName(owner.getFullName())
                    .companyName(owner.getCompanyName())
                    .verified(owner.getVerified())
                    .token(token)
                    .message("OK")
                    .build());
        } catch (Exception e) {
            return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Authentication failed",
                e.getMessage()
            );
        }
    }
    
    /**
     * Build a standardized error response
     */
    private ResponseEntity<?> buildErrorResponse(HttpStatus status, String error, String message) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        return new ResponseEntity<>(errorResponse, status);
    }
}