package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "admins")
public class Admin {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash", nullable = false)
    private String password;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Builder.Default
    @Column(name = "is_active")
    private Boolean active = true;
    
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private AdminRole role = AdminRole.ADMIN; // ADMIN, SUPER_ADMIN
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    public enum AdminRole {
        ADMIN,       // Regular admin — can manage apps, users, reports
        SUPER_ADMIN  // Super admin — full access including admin management
    }
}