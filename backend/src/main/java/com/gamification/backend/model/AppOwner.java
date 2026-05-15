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
@Table(name = "app_owners")
public class AppOwner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    // Nullable — Google users have no password
    @Column(name = "password_hash" , nullable = true)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "company_name")
    private String companyName;

    // Profile picture URL from Google
    @Column(name = "picture_url")
    private String pictureUrl;

    // AUTH_LOCAL | AUTH_GOOGLE
    @Builder.Default
    @Column(name = "auth_provider")
    private String authProvider = "AUTH_LOCAL";

    // Google's unique user ID — used to match returning Google users
    @Column(name = "google_id", unique = true)
    private String googleId;

    @Builder.Default
    @Column(name = "is_verified")
    private Boolean verified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "verified_by_admin_email")
    private String verifiedByAdminEmail;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}