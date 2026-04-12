package com.gamification.backend.dto.profile;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ProfileResponse {
    private Long          id;
    private String        email;
    private String        fullName;
    private String        companyName;
    private Boolean       isVerified;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;

    // Stats
    private long totalApps;
    private long totalRules;
    private long totalAdvancedRules;
}