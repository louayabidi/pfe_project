package com.gamification.backend.dto.user;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class UserProfileResponse {
    private String         userId;
    private Integer        balance;
    private Integer        lifetimeEarned;
    private List<SdkBadgeResponse> badges; 

    //  Flutter reads json['points'] — alias for balance
    public Integer getPoints() {
        return balance;
    }
}