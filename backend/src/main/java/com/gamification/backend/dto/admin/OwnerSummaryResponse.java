package com.gamification.backend.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OwnerSummaryResponse {

    private Long          id;
    private String        email;
    private String        fullName;
    private String        companyName;
    private Boolean       verified;
    private Boolean       active;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;

    // Stats
    private long totalApps;
    private long totalRules;
    private long totalAdvancedRules;
}