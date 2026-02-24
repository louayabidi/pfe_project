package com.gamification.backend.service;

import com.gamification.backend.dto.RegisterRequest;
import com.gamification.backend.dto.LoginRequest;
import com.gamification.backend.dto.AuthResponse;
import com.gamification.backend.model.AppOwner;
import com.gamification.backend.repository.AppOwnerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AppOwnerRepository ownerRepository;
    private final JwtService jwtService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Tentative d'inscription pour l'email: {}", request.getEmail());
        
        if (ownerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        
        AppOwner owner = AppOwner.builder()
                .email(request.getEmail())
                .password(request.getPassword())
                .fullName(request.getFullName())
                .companyName(request.getCompanyName())
                .verified(false)
                .verificationToken(UUID.randomUUID().toString())
                .build();
        
        AppOwner savedOwner = ownerRepository.save(owner);
        log.info("Propriétaire créé avec ID: {}", savedOwner.getId());
        
        return AuthResponse.builder()
                .id(savedOwner.getId())
                .email(savedOwner.getEmail())
                .fullName(savedOwner.getFullName())
                .companyName(savedOwner.getCompanyName())
                .verified(savedOwner.getVerified())
                .token(jwtService.generateToken(savedOwner.getEmail()))
                .message("Inscription réussie ! Vérifiez votre email.")
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        log.info("Tentative de connexion pour l'email: {}", request.getEmail());
        
        AppOwner owner = ownerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));
        
        if (!owner.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
        
        owner.setLastLogin(LocalDateTime.now());
        ownerRepository.save(owner);
        
        return AuthResponse.builder()
                .id(owner.getId())
                .email(owner.getEmail())
                .fullName(owner.getFullName())
                .companyName(owner.getCompanyName())
                .verified(owner.getVerified())
                .token(jwtService.generateToken(owner.getEmail()))
                .message("Connexion réussie")
                .build();
    }
}