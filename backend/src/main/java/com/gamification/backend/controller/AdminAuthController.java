package com.gamification.backend.controller;

import com.gamification.backend.dto.admin.AdminAuthResponse;
import com.gamification.backend.dto.admin.AdminLoginRequest;
import com.gamification.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminService adminService;

    /**
     * POST /api/admin/auth/login
     * Login pour ADMIN et SUPER_ADMIN — retourne un JWT avec le rôle encodé
     */
    @PostMapping("/login")
    public ResponseEntity<AdminAuthResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(adminService.login(request));
    }
}