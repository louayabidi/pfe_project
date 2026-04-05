package com.gamification.backend.service;

import com.gamification.backend.dto.points_transaction.PointsResponse;
import com.gamification.backend.model.PointsBalance;
import com.gamification.backend.repository.PointsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PointsService {

    private final PointsRepository pointsRepository;

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