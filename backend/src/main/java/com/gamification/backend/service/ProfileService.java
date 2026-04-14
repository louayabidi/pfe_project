package com.gamification.backend.service;

import com.gamification.backend.dto.profile.ChangePasswordRequest;
import com.gamification.backend.dto.profile.ProfileResponse;
import com.gamification.backend.dto.profile.UpdateProfileRequest;
import com.gamification.backend.model.AppOwner;
import com.gamification.backend.repository.AdvancedRuleRepository;
import com.gamification.backend.repository.AppOwnerRepository;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.RuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final AppOwnerRepository    ownerRepository;
    private final AppRepository         appRepository;
    private final RuleRepository        ruleRepository;
    private final AdvancedRuleRepository advancedRuleRepository;
    private final PasswordEncoder       passwordEncoder;

    // ── GET profile ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        AppOwner owner = findOwner(email);

        long totalApps          = appRepository.countByOwnerId(owner.getId());
        long totalRules         = ruleRepository.countByAppOwnerId(owner.getId());
        long totalAdvancedRules = advancedRuleRepository.countByAppOwnerId(owner.getId());

        return toResponse(owner, totalApps, totalRules, totalAdvancedRules);
    }

    // ── UPDATE profile ───────────────────────────────────────────────────────

    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest req) {
        AppOwner owner = findOwner(email);
        owner.setFullName(req.getFullName());
        owner.setCompanyName(req.getCompanyName());
        AppOwner saved = ownerRepository.save(owner);
        log.info("[Profile] Profil mis à jour pour '{}'", email);

        long totalApps          = appRepository.countByOwnerId(owner.getId());
        long totalRules         = ruleRepository.countByAppOwnerId(owner.getId());
        long totalAdvancedRules = advancedRuleRepository.countByAppOwnerId(owner.getId());

        return toResponse(saved, totalApps, totalRules, totalAdvancedRules);
    }

    // ── CHANGE password ──────────────────────────────────────────────────────

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Les mots de passe ne correspondent pas");
        }

        AppOwner owner = findOwner(email);

        if (!passwordEncoder.matches(req.getCurrentPassword(), owner.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Mot de passe actuel incorrect");
        }

       owner.setPassword(passwordEncoder.encode(req.getNewPassword()));
        ownerRepository.save(owner);
        log.info("[Profile] Mot de passe changé pour '{}'", email);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private AppOwner findOwner(String email) {
        return ownerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    private ProfileResponse toResponse(AppOwner o, long apps, long rules, long advRules) {
        return ProfileResponse.builder()
                .id(o.getId())
                .email(o.getEmail())
                .fullName(o.getFullName())
                .companyName(o.getCompanyName())
                .isVerified(o.getVerified())
                .lastLogin(o.getLastLogin())
                .createdAt(o.getCreatedAt())
                .totalApps(apps)
                .totalRules(rules)
                .totalAdvancedRules(advRules)
                .build();
    }
}