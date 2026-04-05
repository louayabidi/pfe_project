package com.gamification.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
 
import java.time.LocalDate;
 
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatisticsDTO {
    private LocalDate date;
    private Long newUsersCount;
    private Long activeUsers;
}
 