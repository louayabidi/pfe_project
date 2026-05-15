package com.gamification.backend.config;

import com.gamification.backend.model.Admin;
import com.gamification.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SuperAdminInitializer implements ApplicationRunner {

    private final AdminRepository   adminRepository;
    private final PasswordEncoder   passwordEncoder;

    // Override via env vars or application.properties
    @Value("${superadmin.email:superadmin@gamification.com}")
    private String superAdminEmail;

    @Value("${superadmin.password:SuperAdmin@2026!}")
    private String superAdminPassword;

    @Value("${superadmin.name:Louay Abidi}")
    private String superAdminName;

    @Override
    public void run(ApplicationArguments args) {
        if (adminRepository.existsByEmail(superAdminEmail)) {
            log.info("[SuperAdmin] Compte super admin déjà existant: {}", superAdminEmail);
            return;
        }

        Admin superAdmin = Admin.builder()
                .email(superAdminEmail)
                .password(passwordEncoder.encode(superAdminPassword))
                .fullName(superAdminName)
                .role(Admin.AdminRole.SUPER_ADMIN)
                .active(true)
                .build();

        adminRepository.save(superAdmin);
        log.info("[SuperAdmin] ✅ Compte super admin créé: {}", superAdminEmail);
    }
    
}