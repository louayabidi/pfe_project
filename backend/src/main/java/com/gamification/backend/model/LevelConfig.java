package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "level_configs")
public class LevelConfig {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    @Column(nullable = false)
    private String name;

    /**
     * FLAT  = same XP threshold every level (flatThreshold points to advance)
     * CUSTOM = explicit XP threshold per level (customThresholdsJson)
     */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ThresholdType thresholdType = ThresholdType.FLAT;

    /** XP needed per level when thresholdType = FLAT */
    @Builder.Default
    private Integer flatThreshold = 1000;

    /**
     * XP needed per level when thresholdType = CUSTOM.
     * JSON int array: [100, 250, 500, 1000, 2000, ...]
     * Index 0 = XP to reach level 2, index 1 = XP to reach level 3, etc.
     */
    @Column(name = "custom_thresholds_json", columnDefinition = "TEXT")
    private String customThresholdsJson;

    /**
     * Psychological head-start: after a level-up the progress bar starts at
     * this % of the next level (0–25).  Default 15.
     */
    @Builder.Default
    private Integer headStartPct = 15;

    /**
     * Level title strings JSON.
     * Example: ["Rookie","Explorer","Veteran","Legend","Champion"]
     * Null index = generic "Level N" label.
     */
    @Column(name = "level_titles_json", columnDefinition = "TEXT")
    private String levelTitlesJson;

    /**
     * Rewards per level JSON.
     * Format: [{"level":2,"points":100,"badgeId":null}, ...]
     */
    @Column(name = "level_rewards_json", columnDefinition = "TEXT")
    private String levelRewardsJson;

    @Builder.Default
    private Integer maxLevel = 100;

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    public enum ThresholdType { FLAT, CUSTOM }
}