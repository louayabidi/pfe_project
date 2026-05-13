package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "level_configs")
public class LevelConfig {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore                         
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ThresholdType thresholdType = ThresholdType.FLAT;

    @Builder.Default
    private Integer flatThreshold = 1000;

    @Column(name = "custom_thresholds_json", columnDefinition = "TEXT")
    private String customThresholdsJson;

    @Builder.Default
    private Integer headStartPct = 15;

    @Column(name = "level_titles_json", columnDefinition = "TEXT")
    private String levelTitlesJson;

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