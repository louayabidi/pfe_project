package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "user_levels",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "level_config_id"}))
public class UserLevel {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "app_id", nullable = false)
    private Long appId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_config_id", nullable = false)
    private LevelConfig levelConfig;

    @Builder.Default
    private Integer currentLevel = 1;

    /**
     * XP accumulated within the CURRENT level only (resets on level-up).
     * Includes the head-start offset after a level-up.
     */
    @Builder.Default
    private Integer currentXp = 0;

    /** Total lifetime XP — used to recalculate level if config changes */
    @Builder.Default
    private Integer totalXp = 0;

    /**
     * JSON array of level numbers for which rewards have been awarded.
     * Prevents double-awarding on recalculation.
     * Example: [2, 3, 4]
     */
    @Column(name = "awarded_levels_json", columnDefinition = "TEXT")
    @Builder.Default
    private String awardedLevelsJson = "[]";

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}