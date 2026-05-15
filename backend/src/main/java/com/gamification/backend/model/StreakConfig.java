package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "streak_configs")
public class StreakConfig {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;
    
    @Column(nullable = false)
    private String name;                              // e.g., "Daily Login Streak"
    
    @Column(name = "qualifying_events_json", columnDefinition = "TEXT")
    private String qualifyingEventsJson;              // ["daily_login", "lesson_complete"]
    
    @Enumerated(EnumType.STRING)
    @Column(name = "window_type", nullable = false)
    @Builder.Default
    private WindowType windowType = WindowType.CALENDAR_DAY; // CALENDAR_DAY or ROLLING_24H
    
    @Builder.Default
    private Integer graceHours = 0;                   // e.g., 4 hours grace period
    
    @Builder.Default
    private Integer maxFreezeTokens = 1;              // Max freeze tokens user can hold
    
    @Column(name = "milestones_json", columnDefinition = "TEXT")
    private String milestonesJson;                    // Day targets with rewards
    
    @Column(name = "multipliers_json", columnDefinition = "TEXT")
    private String multipliersJson;                   // Point multiplier tiers
    
    private Integer comebackAfterDays;                // Days before "comeback bonus"
    private Integer comebackBonusPoints;              // Bonus when returning
    
    @Builder.Default
    private Boolean active = true;
    
    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
    
    public enum WindowType { 
        CALENDAR_DAY,  // Resets at midnight
        ROLLING_24H    // 24-hour rolling window
    }
}