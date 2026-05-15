package com.gamification.backend.controller;

import com.gamification.backend.dto.RegisterRequest;
import com.gamification.backend.model.AppOwner;
import com.gamification.backend.repository.AppOwnerRepository;
import com.gamification.backend.dto.LoginRequest;
import com.gamification.backend.dto.AuthResponse;
import com.gamification.backend.service.AuthService;
import com.gamification.backend.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
     private final JwtService jwtService;                   
    private final AppOwnerRepository ownerRepository;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/test")
    public String test() {
        return "✅ API Auth fonctionne !";
    }

    @GetMapping("/me")
public ResponseEntity<AuthResponse> me(HttpServletRequest request) {
    String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
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
}
}