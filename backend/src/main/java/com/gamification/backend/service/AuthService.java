package com.gamification.backend.service;

import com.gamification.backend.dto.RegisterRequest;
import com.gamification.backend.dto.LoginRequest;
import com.gamification.backend.dto.AuthResponse;
import com.gamification.backend.exception.AccountLockedException;
import com.gamification.backend.exception.WeakPasswordException;
import com.gamification.backend.model.AppOwner;
import com.gamification.backend.repository.AppOwnerRepository;
import com.gamification.backend.util.PasswordValidator;
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
        
        // Validate email doesn't already exist
        if (ownerRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        
        // Validate password strength
        PasswordValidator.PasswordValidationResult validationResult = 
            PasswordValidator.validate(request.getPassword());
        if (!validationResult.isValid()) {
            throw new WeakPasswordException(validationResult.getMessage());
        }
        
        // Create new owner
        AppOwner owner = AppOwner.builder()
                .email(request.getEmail())
                .password(request.getPassword()) // In production, use BCrypt: passwordEncoder.encode()
                .fullName(request.getFullName())
                .companyName(request.getCompanyName())
                .verified(false)
                .verificationToken(UUID.randomUUID().toString())
                .failedLoginAttempts(0)
                .authProvider("AUTH_LOCAL")
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
    
   

@Transactional(noRollbackFor = {RuntimeException.class, AccountLockedException.class})
public AuthResponse login(LoginRequest request) {
    log.info("Tentative de connexion pour l'email: {}", request.getEmail());

    AppOwner owner = ownerRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

    // Check lockout
    if (owner.getLockedUntil() != null) {
        if (LocalDateTime.now().isBefore(owner.getLockedUntil())) {
            long remaining = owner.getRemainingLockoutSeconds();
            log.warn("Compte verrouillé: {} ({}s restants)", request.getEmail(), remaining);
            throw new AccountLockedException(remaining);
        } else {
            owner.resetFailedLoginAttempts();
            ownerRepository.saveAndFlush(owner);
        }
    }

    // Wrong password
    if (!owner.getPassword().equals(request.getPassword())) {
        owner.recordFailedLoginAttempt();
        ownerRepository.saveAndFlush(owner); // ← flush forces immediate DB write before rollback

        if (owner.isLockedOut()) {
            long lockoutSeconds = owner.getRemainingLockoutSeconds();
            log.warn("Compte verrouillé après trop de tentatives: {}", request.getEmail());
            throw new AccountLockedException(lockoutSeconds);
        }

        int remainingAttempts = Math.max(0, 6 - owner.getFailedLoginAttempts());
        log.warn("Mot de passe incorrect pour: {}. Tentatives restantes: {}",
                request.getEmail(), remainingAttempts);

        throw new RuntimeException(
            "Email ou mot de passe incorrect. Tentatives restantes: " + remainingAttempts
        );
    }

    // Success
    owner.resetFailedLoginAttempts();
    owner.setLastLogin(LocalDateTime.now());
    ownerRepository.saveAndFlush(owner);

    log.info("Connexion réussie pour: {}", request.getEmail());

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