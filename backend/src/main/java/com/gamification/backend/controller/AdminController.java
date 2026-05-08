package com.gamification.backend.controller;

import com.gamification.backend.dto.admin.*;
import com.gamification.backend.model.Admin;
import com.gamification.backend.service.AdminService;
import com.gamification.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final JwtService   jwtService;

    // ── helpers ───────────────────────────────────────────────────────────────

    /** Extract the bearer token from the request and return the encoded role claim. */
    private String extractRole(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return "";
        return jwtService.extractRole(header.substring(7));
    }

    private String extractEmail(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return "";
        return jwtService.extractEmail(header.substring(7));
    }

    private void requireSuperAdmin(HttpServletRequest request) {
        if (!"SUPER_ADMIN".equals(extractRole(request))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Accès réservé au Super Admin");
        }
    }

    private void requireAdmin(HttpServletRequest request) {
        String role = extractRole(request);
        if (!"ADMIN".equals(role) && !"SUPER_ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Accès réservé aux admins");
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // PLATFORM STATS  —  GET /api/admin/stats
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsResponse> getStats(HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // OWNERS  —  /api/admin/owners
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/owners")
    public ResponseEntity<List<OwnerSummaryResponse>> getAllOwners(HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(adminService.getAllOwners());
    }

    @GetMapping("/owners/{id}")
    public ResponseEntity<OwnerSummaryResponse> getOwner(@PathVariable Long id,
                                                          HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(adminService.getOwnerById(id));
    }

    @PutMapping("/owners/{id}/toggle")
    public ResponseEntity<OwnerSummaryResponse> toggleOwner(@PathVariable Long id,
                                                              HttpServletRequest request) {
        requireAdmin(request);
        return ResponseEntity.ok(adminService.toggleOwnerStatus(id));
    }

    @PatchMapping("/owners/{id}/verify")
    public ResponseEntity<OwnerSummaryResponse> verifyOwner(
            @PathVariable Long id,
            @Valid @RequestBody VerifyOwnerRequest request,
            HttpServletRequest httpRequest) {
        requireAdmin(httpRequest);
        String adminEmail = extractEmail(httpRequest);
        return ResponseEntity.ok(adminService.verifyOwner(id, request, adminEmail));
    }

    @DeleteMapping("/owners/{id}")
    public ResponseEntity<Void> deleteOwner(@PathVariable Long id,
                                             HttpServletRequest request) {
        requireAdmin(request);
        adminService.deleteOwner(id);
        return ResponseEntity.noContent().build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADMINS  —  /api/admin/admins   (SUPER_ADMIN only)
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/admins")
    public ResponseEntity<List<AdminUserResponse>> getAllAdmins(HttpServletRequest request) {
        requireSuperAdmin(request);
        List<AdminUserResponse> list = adminService.getAllAdmins()
                .stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/admins")
    public ResponseEntity<AdminUserResponse> createAdmin(
            @Valid @RequestBody CreateAdminRequest body,
            HttpServletRequest request) {
        requireSuperAdmin(request);
        Admin created = adminService.createAdmin(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(toAdminUserResponse(created));
    }

    @PutMapping("/admins/{id}/toggle")
    public ResponseEntity<AdminUserResponse> toggleAdmin(@PathVariable Long id,
                                                          HttpServletRequest request) {
        requireSuperAdmin(request);
        Admin toggled = adminService.toggleAdminStatus(id);
        return ResponseEntity.ok(toAdminUserResponse(toggled));
    }

    // ── mapper ────────────────────────────────────────────────────────────────

    private AdminUserResponse toAdminUserResponse(Admin a) {
        return AdminUserResponse.builder()
                .id(a.getId())
                .email(a.getEmail())
                .fullName(a.getFullName())
                .role(a.getRole())
                .active(Boolean.TRUE.equals(a.getActive()))
                .createdAt(a.getCreatedAt())
                .lastLogin(a.getLastLogin())
                .build();
    }
}