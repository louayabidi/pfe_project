package com.gamification.backend.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardPageDTO {
    private List<LeaderboardEntryDTO> entries;
    private Long totalCount;
    private int page;
    private int size;
    private Long totalPages;
}