package com.gamification.backend.dto.user;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SdkBadgeResponse {
    private Long   badgeId;    //  Flutter reads 'badgeId'
    private String name;
    private String imageUrl;
    private String awardedAt;  //  Flutter reads 'awardedAt' as String
}