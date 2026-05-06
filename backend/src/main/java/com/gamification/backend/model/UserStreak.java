package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "user_streaks",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "streak_config_id"}))
public class UserStreak {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    /** Denormalized for faster queries without joining through streak_config */
    @Column(name = "app_id", nullable = false)
    private Long appId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "streak_config_id", nullable = false)
    private StreakConfig streakConfig;

    @Builder.Default
    private Integer currentStreak = 0;

    @Builder.Default
    private Integer longestStreak = 0;

    /** Number of freeze tokens currently held by this user */
    @Builder.Default
    private Integer freezeTokens = 0;

    /** Timestamp of the last qualifying event */
    private LocalDateTime lastActivityAt;

    /**
     * JSON array of milestone days already awarded to prevent double-awarding.
     * Example: [3, 7, 14]
     */
    @Column(name = "awarded_milestones_json", columnDefinition = "TEXT")
    @Builder.Default
    private String awardedMilestonesJson = "[]";

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}