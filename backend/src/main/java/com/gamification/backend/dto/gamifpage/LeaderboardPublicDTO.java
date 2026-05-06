package com.gamification.backend.dto.gamifpage;
 
import com.gamification.backend.dto.leaderboard.LeaderboardEntryDTO;
import lombok.Builder;
import lombok.Data;
import java.util.List;
 
@Data @Builder
public class LeaderboardPublicDTO {
    private List<LeaderboardEntryDTO> top3;
    private List<LeaderboardEntryDTO> topN;      // full list (leaderboardSize entries)
    private LeaderboardEntryDTO       userRank;  // null when userId not in board
    private Long                      totalUsers;
}
 