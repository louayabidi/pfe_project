package com.gamification.backend.dto.user;

import com.gamification.backend.dto.badge.BadgeResponse;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private String userId;
    private Integer balance;
    private Integer lifetimeEarned;
    private List<BadgeResponse> badges;
}