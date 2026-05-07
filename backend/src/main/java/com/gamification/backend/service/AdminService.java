package com.gamification.backend.service;

import com.gamification.backend.dto.admin.*;
import com.gamification.backend.model.Admin;
import com.gamification.backend.model.AppOwner;
import com.gamification.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository        adminRepository;
    private final AppOwnerRepository     ownerRepository;
    private final AppRepository          appRepository;
    private final RuleRepository         ruleRepository;
    private final AdvancedRuleRepository advancedRuleRepository;
    private final PasswordEncoder        passwordEncoder;
    private final JwtService             jwtService;

    // ══════════════════════════════════════════════════════════════════════════
    // AUTH
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional
    public AdminAuthResponse login(AdminLoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect"));

        if (!admin.getActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Compte admin désactivé");
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");
        }

        admin.setLastLogin(LocalDateTime.now());
        adminRepository.save(admin);

        // Token includes role claim via subject prefix
        String token = jwtService.generateAdminToken(admin.getEmail(), admin.getRole().name());

        log.info("[Admin] Connexion réussie: {} ({})", admin.getEmail(), admin.getRole());

        return AdminAuthResponse.builder()
                .id(admin.getId())
                .email(admin.getEmail())
                .fullName(admin.getFullName())
                .role(admin.getRole())
                .token(token)
                .message("Connexion admin réussie")
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PLATFORM STATS
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public PlatformStatsResponse getPlatformStats() {
        long totalOwners        = ownerRepository.count();
        long activeOwners       = ownerRepository.countByActive(true);
        long verifiedOwners     = ownerRepository.countByVerified(true);
        long totalAdmins        = adminRepository.count();
        long totalApps          = appRepository.count();
        long totalRules         = ruleRepository.count();
        long totalAdvancedRules = advancedRuleRepository.count();

        return PlatformStatsResponse.builder()
                .totalOwners(totalOwners)
                .activeOwners(activeOwners)
                .verifiedOwners(verifiedOwners)
                .totalAdmins(totalAdmins)
                .totalApps(totalApps)
                .totalRules(totalRules)
                .totalAdvancedRules(totalAdvancedRules)
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // OWNERS MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<OwnerSummaryResponse> getAllOwners() {
        return ownerRepository.findAll()
                .stream()
                .map(this::toOwnerSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OwnerSummaryResponse getOwnerById(Long id) {
        AppOwner owner = findOwner(id);
        return toOwnerSummary(owner);
    }

    @Transactional
    public OwnerSummaryResponse toggleOwnerStatus(Long id) {
        AppOwner owner = findOwner(id);
        boolean newStatus = !Boolean.TRUE.equals(owner.getActive());
        owner.setActive(newStatus);
        ownerRepository.save(owner);
        log.info("[Admin] Owner {} {} (id={})",
                owner.getEmail(), newStatus ? "activé" : "suspendu", id);
        return toOwnerSummary(owner);
    }

    @Transactional
    public void deleteOwner(Long id) {
        AppOwner owner = findOwner(id);
        ownerRepository.delete(owner);
        log.warn("[Admin] Owner supprimé: {} (id={})", owner.getEmail(), id);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADMINS MANAGEMENT (SUPER_ADMIN only)
    // ══════════════════════════════════════════════════════════════════════════

    @Transactional
    public Admin createAdmin(CreateAdminRequest request) {
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Un admin avec cet email existe déjà");
        }

        Admin admin = Admin.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Admin.AdminRole.ADMIN)
                .active(true)
                .build();

        Admin saved = adminRepository.save(admin);
        log.info("[SuperAdmin] Nouvel admin créé: {}", saved.getEmail());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    @Transactional
    public Admin toggleAdminStatus(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Admin introuvable"));

        if (admin.getRole() == Admin.AdminRole.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Impossible de désactiver le super admin");
        }

        admin.setActive(!Boolean.TRUE.equals(admin.getActive()));
        Admin saved = adminRepository.save(admin);
        log.info("[SuperAdmin] Admin {} {}", saved.getEmail(),
                saved.getActive() ? "activé" : "désactivé");
        return saved;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ══════════════════════════════════════════════════════════════════════════

    private AppOwner findOwner(Long id) {
        return ownerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Owner introuvable"));
    }

    private OwnerSummaryResponse toOwnerSummary(AppOwner o) {
        long apps          = appRepository.countByOwnerId(o.getId());
        long rules         = ruleRepository.countByAppOwnerId(o.getId());
        long advancedRules = advancedRuleRepository.countByAppOwnerId(o.getId());

        return OwnerSummaryResponse.builder()
                .id(o.getId())
                .email(o.getEmail())
                .fullName(o.getFullName())
                .companyName(o.getCompanyName())
                .verified(o.getVerified())
                .active(Boolean.TRUE.equals(o.getActive()))
                .createdAt(o.getCreatedAt())
                .lastLogin(o.getLastLogin())
                .totalApps(apps)
                .totalRules(rules)
                .totalAdvancedRules(advancedRules)
                .build();
    }
}