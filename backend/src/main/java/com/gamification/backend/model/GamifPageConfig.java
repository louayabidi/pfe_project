package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "gamif_page_configs")
public class GamifPageConfig {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Public key used by the Flutter SDK — pk_page_xxx */
    @Column(nullable = false, unique = true)
    private String publishableKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    @Column(nullable = false)
    private String name;

    // ── Theme ────────────────────────────────────────────────────────────────
    private String backgroundColor;   // page bg
    private String primaryColor;      // hero, buttons
    private String accentColor;       // badges, highlights
    private String textColor;
    private String cardColor;         // section card bg
    @Builder.Default
    private Integer borderRadius = 16;
    @Builder.Default
    private Boolean darkMode = true;
    @Builder.Default
    private Boolean animate  = true;

    // ── Badge settings ────────────────────────────────────────────────────────
    @Builder.Default
    private Boolean showLockedBadges = true;
    @Builder.Default
    private Integer badgeColumns = 3;

    // ── Leaderboard settings ──────────────────────────────────────────────────
    @Builder.Default
    private Integer leaderboardSize  = 10;
    @Builder.Default
    private String  leaderboardSortBy = "points";   // points | events | days

    /**
     * Ordered section config — JSON array.
     * Each item: { "type": "hero|leaderboard|badges|stats", "enabled": true,
     *              "title": "...", "config": { section-specific } }
     */
    @Column(name = "sections_json", columnDefinition = "TEXT")
    private String sectionsJson;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;
}