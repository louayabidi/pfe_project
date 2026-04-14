
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
    private String publishableKey;  // pk_live_xxx or pk_test_xxx
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;
    
    @Column(nullable = false)
    private String name;  // "Default Widget" or "Mobile Header Widget"
    
    // Display configuration
    @Column(nullable = false)
    private String displayMode;  // pill, card, full
    
    @Column(nullable = false)
    private String contentMode;  // points, badges, both
    
    // Colors (store as hex strings)
    private String backgroundColor;  // "#6C63FF"
    private String textColor;        // "#FFFFFF"
    private String accentColor;      // "#34D399"
    
    // Options
    private String label;            // "Points"
    private Boolean showLifetime;
    private Boolean showLevel;
    private Boolean animate;
    private Integer borderRadius;
    
    // Additional styling
    private String fontFamily;
    private Boolean darkMode;
    private String language;  // en, fr, es, etc.
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}