package com.gamification.backend.service;

import com.gamification.backend.dto.analytics.*;
import com.gamification.backend.dto.leaderboard.LeaderboardEntryDTO;
import com.gamification.backend.dto.leaderboard.LeaderboardPageDTO;
import com.gamification.backend.repository.AnalyticsRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepo;

    public AnalyticsOverviewDTO getOverview(Long appId, int days) {
        // Calcul du since pour éviter null
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        long totalEvents  = analyticsRepo.countTotalEvents(appId);
        long totalUsers   = analyticsRepo.countTotalUsers(appId);
        long active7d     = analyticsRepo.countActiveUsersSince(appId, LocalDateTime.now().minusDays(7));
        long active30d    = analyticsRepo.countActiveUsersSince(appId, LocalDateTime.now().minusDays(30));

        // Utilisation des méthodes mappers pour transformer les résultats
        List<TimeSeriesPoint> eventsByDay = toTimeSeries(
            analyticsRepo.findEventsByDay(appId, since)
        );

        List<TimeSeriesPoint> newUsersByDay = toTimeSeries(
            analyticsRepo.findNewUsersByDay(appId, since)
        );

        List<CategoryPoint> topEvents = toCategoryList(
            analyticsRepo.findTopEvents(appId, since)
        );

        List<CategoryPoint> topUsers = toCategoryList(
            analyticsRepo.findTopUsers(appId, since)
        );

        List<HourlyHeatmapPoint> heatmap = toHeatmap(
            analyticsRepo.findHeatmap(appId, since)
        );

        List<RetentionRow> retention = toRetention(
            analyticsRepo.findRetentionCohorts(appId)
        );

        List<CategoryPoint> badges = toCategoryList(
            analyticsRepo.findBadgeDistribution(appId)
        );

        double avg = totalUsers > 0 ? (double) totalEvents / totalUsers : 0.0;

        return AnalyticsOverviewDTO.builder()
            .totalEvents(totalEvents)
            .totalUsers(totalUsers)
            .activeUsersLast7Days(active7d)
            .activeUsersLast30Days(active30d)
            .avgEventsPerUser(avg)
            .totalBadgesAwarded(analyticsRepo.countTotalBadgesAwarded(appId))
            .totalPointsAwarded(analyticsRepo.sumTotalPointsAwarded(appId))
            .eventsByDay(eventsByDay)
            .newUsersByDay(newUsersByDay)
            .topEvents(topEvents)
            .topUsers(topUsers)
            .badgeDistribution(badges)
            .retentionMatrix(retention)
            .heatmap(heatmap)
            .build();
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private List<TimeSeriesPoint> toTimeSeries(List<Object[]> rows) {
        List<TimeSeriesPoint> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new TimeSeriesPoint(
                (String) row[0],
                ((Number) row[1]).longValue()
            ));
        }
        return result;
    }

    private List<CategoryPoint> toCategoryList(List<Object[]> rows) {
        List<CategoryPoint> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new CategoryPoint(
                (String) row[0],
                ((Number) row[1]).longValue()
            ));
        }
        return result;
    }

    private List<HourlyHeatmapPoint> toHeatmap(List<Object[]> rows) {
        List<HourlyHeatmapPoint> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new HourlyHeatmapPoint(
                ((Number) row[0]).intValue(),
                ((Number) row[1]).intValue(),
                ((Number) row[2]).longValue()
            ));
        }
        return result;
    }

    private List<RetentionRow> toRetention(List<Object[]> rows) {
        Map<String, Map<Integer, Long>> cohortMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String cohort  = (String) row[0];
            int weekNum    = ((Number) row[1]).intValue();
            long users     = ((Number) row[2]).longValue();
            cohortMap.computeIfAbsent(cohort, k -> new TreeMap<>()).put(weekNum, users);
        }

        List<RetentionRow> result = new ArrayList<>();
        for (Map.Entry<String, Map<Integer, Long>> entry : cohortMap.entrySet()) {
            Map<Integer, Long> weeks = entry.getValue();
            long week0Users = weeks.getOrDefault(0, 1L);

            List<Double> rates = new ArrayList<>();
            for (int w = 0; w <= 8; w++) {
                long count = weeks.getOrDefault(w, 0L);
                double retention = week0Users > 0 ? (count * 100.0 / week0Users) : 0;
                rates.add(Math.round(retention * 10.0) / 10.0);
            }
            result.add(new RetentionRow(entry.getKey(), rates));
        }

        return result;
    }





public LeaderboardPageDTO getLeaderboard(Long appId, int page, int size, String sortBy) {
    page = Math.max(0, page);
    size = Math.min(100, Math.max(1, size));
    int offset = page * size;

    List<Object[]> rows = switch (sortBy) {
        case "events" -> analyticsRepo.findLeaderboardByEvents(appId, size, offset);
        case "days"   -> analyticsRepo.findLeaderboardByDays(appId, size, offset);
        case "rules"  -> analyticsRepo.findLeaderboardByRules(appId, size, offset);
        default       -> analyticsRepo.findLeaderboardByPoints(appId, size, offset);
    };

    long totalCount = analyticsRepo.countLeaderboardUsers(appId);
    long totalPages = (totalCount + size - 1) / size;

    List<LeaderboardEntryDTO> entries = rows.stream()
        .map(row -> LeaderboardEntryDTO.builder()
            .rank(((Number) row[6]).longValue())
            .userId((String) row[0])
            .lifetimePoints(((Number) row[1]).longValue())
            .totalEvents(((Number) row[2]).longValue())
            .activeDaysCount(((Number) row[3]).longValue())
            .rulesTriggered(((Number) row[4]).longValue())
            .lastEventAt(row[5] != null
                ? ((java.sql.Timestamp) row[5]).toLocalDateTime()
                : null)
            .build())
        .collect(Collectors.toList());

    return LeaderboardPageDTO.builder()
        .entries(entries)
        .totalCount(totalCount)
        .page(page)
        .size(size)
        .totalPages(totalPages)
        .build();
}

}