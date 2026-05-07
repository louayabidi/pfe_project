package com.gamification.backend.controller;

import com.gamification.backend.dto.admin.*;
import com.gamification.backend.model.Admin;
import com.gamification.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ══════════════════════════════════════════════════════════════════════════
    // PLATFORM STATS  —  GET /api/admin/stats
    // ══════════════════════════════════════════════════════════════════════════

    @GetMapping("/stats")
    public ResponseEntity<PlatformStatsResponse> getPlatformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    // ══════════════════════════════════════════════════════════════════════════
    // OWNERS  —  /api/admin/owners
    // ══════════════════════════════════════════════════════════════════════════

    /** Liste tous les app owners */
    @GetMapping("/owners")
    public ResponseEntity<List<OwnerSummaryResponse>> getAllOwners() {
        return ResponseEntity.ok(adminService.getAllOwners());
    }

    /** Détail d'un owner */
    @GetMapping("/owners/{id}")
    public ResponseEntity<OwnerSummaryResponse> getOwner(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getOwnerById(id));
    }

    /** Activer / suspendre un owner */
    @PutMapping("/owners/{id}/toggle")
    public ResponseEntity<OwnerSummaryResponse> toggleOwner(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleOwnerStatus(id));
    }

    /** Supprimer un owner (SUPER_ADMIN uniquement) */
    @DeleteMapping("/owners/{id}")
    public ResponseEntity<Void> deleteOwner(@PathVariable Long id) {
        adminService.deleteOwner(id);
        return ResponseEntity.noContent().build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ADMINS  —  /api/admin/admins  (SUPER_ADMIN only)
    // ══════════════════════════════════════════════════════════════════════════

    /** Créer un admin secondaire */
    @PostMapping("/admins")
    public ResponseEntity<Admin> createAdmin(@Valid @RequestBody CreateAdminRequest request) {
        return new ResponseEntity<>(adminService.createAdmin(request), HttpStatus.CREATED);
    }

    /** Liste tous les admins */
    @GetMapping("/admins")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    /** Activer / désactiver un admin */
    @PutMapping("/admins/{id}/toggle")
    public ResponseEntity<Admin> toggleAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleAdminStatus(id));
    }
}