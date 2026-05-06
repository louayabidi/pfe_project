package com.gamification.backend.dto.gamifpage;
 
import lombok.Data;
 
@Data
public class GamifPageConfigRequest {
    private String  name;
    private String  backgroundColor;
    private String  primaryColor;
    private String  accentColor;
    private String  textColor;
    private String  cardColor;
    private Integer borderRadius;
    private Boolean darkMode;
    private Boolean animate;
    private Boolean showLockedBadges;
    private Integer badgeColumns;
    private Integer leaderboardSize;
    private String  leaderboardSortBy;
    private String  sectionsJson;       // serialised Section[] from Angular
}