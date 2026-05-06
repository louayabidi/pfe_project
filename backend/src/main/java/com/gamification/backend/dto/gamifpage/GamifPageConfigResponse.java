package com.gamification.backend.dto.gamifpage;
 
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
 
@Data @Builder
public class GamifPageConfigResponse {
    private Long    id;
    private String  publishableKey;
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
    private String  sectionsJson;
    private String  flutterSnippet;     // ready-to-paste code
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
 