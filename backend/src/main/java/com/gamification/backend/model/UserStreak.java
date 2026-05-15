package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "user_streaks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "streak_config_id"})
})
public class UserStreak {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "app_id", nullable = false)
    private Long appId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "streak_config_id", nullable = false)
    private StreakConfig streakConfig;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer currentStreak = 0;                // Current consecutive days
    
    @Column(nullable = false)
    @Builder.Default
    private Integer longestStreak = 0;                // Personal record
    
    @Column(nullable = false)
    @Builder.Default
    private Integer freezeTokens = 0;                 // Tokens to skip a day
    
    @Column(name = "awarded_milestones_json", columnDefinition = "TEXT")
    @Builder.Default
    private String awardedMilestonesJson = "[]";      // Already-awarded milestone days
    
    private LocalDateTime lastActivityAt;              // Last day user qualified
    
    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
}