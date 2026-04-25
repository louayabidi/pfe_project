package com.gamification.backend.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private Long rank;
    private String userId;
    private Long lifetimePoints;
    private Long totalEvents;
    private Long activeDaysCount;
    private Long rulesTriggered;
    private LocalDateTime lastEventAt;
}