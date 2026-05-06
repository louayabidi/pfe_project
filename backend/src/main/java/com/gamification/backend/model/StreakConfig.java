package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "streak_configs")
public class StreakConfig {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    @Column(nullable = false)
    private String name;

    /**
     * JSON array of event names that count towards this streak.
     * Empty / null = ANY event qualifies.
     * Example: ["daily_login", "app_open"]
     */
    @Column(name = "qualifying_events_json", columnDefinition = "TEXT")
    private String qualifyingEventsJson;

    /** CALENDAR_DAY = reset at midnight, ROLLING_24H = sliding 24-hour window */
    @Enumerated(EnumType.STRING)
    @Column(name = "window_type", nullable = false)
    @Builder.Default
    private WindowType windowType = WindowType.CALENDAR_DAY;

    /** Hours of grace after window expires before the streak actually breaks */
    @Builder.Default
    private Integer graceHours = 0;

    /** Max freeze tokens a user may hold at once */
    @Builder.Default
    private Integer maxFreezeTokens = 1;

    /**
     * Milestone rewards JSON.
     * Format: [{"day":3,"points":50,"badgeId":null,"freezeToken":false}, ...]
     */
    @Column(name = "milestones_json", columnDefinition = "TEXT")
    private String milestonesJson;

    /**
     * Points multiplier tiers JSON.
     * Format: [{"fromDay":7,"multiplier":1.5},{"fromDay":30,"multiplier":2.0}]
     */
    @Column(name = "multipliers_json", columnDefinition = "TEXT")
    private String multipliersJson;

    /** Comeback bonus: after N missed days, award M points on return */
    private Integer comebackAfterDays;
    private Integer comebackBonusPoints;

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    public enum WindowType { CALENDAR_DAY, ROLLING_24H }
}