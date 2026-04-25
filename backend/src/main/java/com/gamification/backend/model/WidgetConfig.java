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
@Table(name = "widget_configs")
public class WidgetConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String publishableKey;   // pk_live_xxx

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    @Column(nullable = false)
    private String name;

    // ── Display / content ──────────────────────────────────────────────────
    @Column(nullable = false)
    private String displayMode;      // pill | card | full

    @Column(nullable = false)
    private String contentMode;      // points | badges | both

    // ── Colors ────────────────────────────────────────────────────────────
    private String backgroundColor;
    private String textColor;
    private String accentColor;

    // ── Options ───────────────────────────────────────────────────────────
    private String  label;
    private Boolean showLifetime;
    private Boolean showLevel;
    private Boolean animate;
    private Integer borderRadius;

    // ── Styling ───────────────────────────────────────────────────────────
    private String  fontFamily;
    private Boolean darkMode;
    private String  language;

    /**
     * Full canvas layout serialised as JSON by the Widget Studio.
     * Structure: { "frame": { "bg": "#12122A", "radius": 20 },
     *              "elements": [ { "id", "type", "x", "y", "w", "h",
     *                              "bg", "fg", "r", "label", "val",
     *                              "ac", "pct", "fs" }, … ] }
     *
     * When present the Flutter SDK renders this layout verbatim,
     * substituting live SDK data for placeholder values.
     */
    @Column(name = "layout_json", columnDefinition = "TEXT")
    private String layoutJson;

    // ── Timestamps ────────────────────────────────────────────────────────
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}