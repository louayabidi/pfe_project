package com.gamification.backend.service;

import com.gamification.backend.dto.points_transaction.PointsResponse;
import com.gamification.backend.dto.user.SdkBadgeResponse;
import com.gamification.backend.dto.user.UserProfileResponse;
import com.gamification.backend.model.Badge;
import com.gamification.backend.model.PointsBalance;
import com.gamification.backend.repository.BadgeRepository;
import com.gamification.backend.repository.PointsRepository;
import com.gamification.backend.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PointsService {

    private final PointsRepository    pointsRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository     badgeRepository;

    public UserProfileResponse getUserProfile(String userId, Long appId) {

        PointsBalance balance = pointsRepository
                .findByUserIdAndAppId(userId, appId)
                .orElse(PointsBalance.builder()
                        .userId(userId)
                        .balance(0)
                        .lifetimeEarned(0)
                        .build());

        // ✅ Use SdkBadgeResponse so field names match Flutter
        List<SdkBadgeResponse> badges = userBadgeRepository
                .findByUserIdAndAppId(userId, appId)
                .stream()
                .map(ub -> {
                    Badge badge = badgeRepository.findById(ub.getBadgeId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Badge not found: " + ub.getBadgeId()));
                    return SdkBadgeResponse.builder()
                            .badgeId(badge.getId())
                            .name(badge.getName()     != null ? badge.getName()     : "")
                            .imageUrl(badge.getImageUrl() != null ? badge.getImageUrl() : "")
                            .awardedAt(ub.getAwardedAt().toString()) // "2025-01-15T10:30:00"
                            .build();
                })
                .collect(Collectors.toList());

        return UserProfileResponse.builder()
                .userId(userId)
                .balance(balance.getBalance())
                .lifetimeEarned(balance.getLifetimeEarned())
                .badges(badges)
                .build();
    }

    public PointsResponse getUserPoints(String userId, Long appId) {

        PointsBalance balance = pointsRepository
                .findByUserIdAndAppId(userId, appId)
                .orElse(PointsBalance.builder()
                        .userId(userId)
                        .balance(0)
                        .lifetimeEarned(0)
                        .build());

        return PointsResponse.builder()
                .userId(userId)
                .balance(balance.getBalance())
                .lifetimeEarned(balance.getLifetimeEarned())
                .build();
    }
}