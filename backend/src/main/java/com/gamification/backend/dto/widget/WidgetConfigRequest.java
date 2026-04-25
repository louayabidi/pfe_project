package com.gamification.backend.dto.widget;

import lombok.Data;
 
@Data
public class WidgetConfigRequest {
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
 
    /**
     * Full Widget-Studio canvas as JSON string.
     * Sent by the Angular dashboard on every save.
     */
    private String layoutJson;
}