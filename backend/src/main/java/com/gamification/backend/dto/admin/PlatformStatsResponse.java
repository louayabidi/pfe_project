package com.gamification.backend.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlatformStatsResponse {

    private long totalOwners;
    private long activeOwners;
    private long verifiedOwners;
    private long totalAdmins;
    private long totalApps;
    private long totalRules;
    private long totalAdvancedRules;
}