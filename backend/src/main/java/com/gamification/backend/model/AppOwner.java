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
    
    // ==================== NEW FIELDS FOR LOGIN SECURITY ====================
    
    /** Number of failed login attempts since last successful login */
    @Builder.Default
    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;
    
    /** Timestamp when the user was locked out (null if not locked) */
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;
    
    /** Timestamp of the last failed login attempt */
    @Column(name = "last_failed_attempt")
    private LocalDateTime lastFailedAttempt;
    
    // ========================================================================
    
    /**
     * Check if the account is currently locked due to failed login attempts
     */
   // Remove the side effects from isLockedOut()
public boolean isLockedOut() {
    if (lockedUntil == null) return false;
    return LocalDateTime.now().isBefore(lockedUntil); // pure check, no mutation
}

public long getRemainingLockoutSeconds() {
    if (lockedUntil == null || LocalDateTime.now().isAfter(lockedUntil)) return 0;
    return java.time.temporal.ChronoUnit.SECONDS.between(LocalDateTime.now(), lockedUntil);
}
    
    /**
     * Increment failed login attempt counter and lock if necessary
     */
    public void recordFailedLoginAttempt() {
        this.failedLoginAttempts = (failedLoginAttempts == null ? 0 : failedLoginAttempts) + 1;
        this.lastFailedAttempt = LocalDateTime.now();
        
        // Lock account after 6 failed attempts for 10 minutes
        if (this.failedLoginAttempts >= 6) {
            this.lockedUntil = LocalDateTime.now().plusMinutes(10);
        }
    }
    
    /**
     * Reset failed login attempts on successful login
     */
    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lastFailedAttempt = null;
        this.lockedUntil = null;
    }
}