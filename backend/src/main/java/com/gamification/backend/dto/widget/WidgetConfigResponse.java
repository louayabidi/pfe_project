package com.gamification.backend.dto.widget;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class WidgetConfigResponse {
    private Long id;
    private String publishableKey;
    private String name;
    private String displayMode;
    private String contentMode;
    private String backgroundColor;
    private String textColor;
    private String accentColor;
    private String label;
    private Boolean showLifetime;
    private Boolean showLevel;
    private Boolean animate;
    private Integer borderRadius;
    private String fontFamily;
    private Boolean darkMode;
    private String language;
    private String generatedCode;  // The one-liner for the app owner
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}