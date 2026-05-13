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
    private String name;

    @Column(name = "qualifying_events_json", columnDefinition = "TEXT")
    private String qualifyingEventsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "window_type", nullable = false)
    @Builder.Default
    private WindowType windowType = WindowType.CALENDAR_DAY;

    @Builder.Default
    private Integer graceHours = 0;

    @Builder.Default
    private Integer maxFreezeTokens = 1;

    @Column(name = "milestones_json", columnDefinition = "TEXT")
    private String milestonesJson;

    @Column(name = "multipliers_json", columnDefinition = "TEXT")
    private String multipliersJson;

    private Integer comebackAfterDays;
    private Integer comebackBonusPoints;

    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    public enum WindowType { CALENDAR_DAY, ROLLING_24H }
}