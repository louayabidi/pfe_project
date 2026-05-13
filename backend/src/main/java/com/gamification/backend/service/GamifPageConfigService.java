package com.gamification.backend.service;
 
import com.gamification.backend.dto.gamifpage.*;
import com.gamification.backend.dto.leaderboard.LeaderboardEntryDTO;
import com.gamification.backend.model.App;
import com.gamification.backend.model.GamifPageConfig;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.AnalyticsRepository;
import com.gamification.backend.repository.GamifPageConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
 
import java.security.SecureRandom;
import java.util.*;


@Slf4j
@Service
@RequiredArgsConstructor
public class GamifPageConfigService {
 
    private final GamifPageConfigRepository repo;
    private final AppRepository             appRepo;
    private final AnalyticsRepository       analyticsRepo;
    private final SecureRandom              rng = new SecureRandom();
 
    // ── Dashboard: save config ────────────────────────────────────────────────
 
    @Transactional
    public GamifPageConfigResponse save(Long appId, GamifPageConfigRequest req) {
        App app = appRepo.findById(appId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "App not found"));
 
        GamifPageConfig cfg = repo.findByAppIdAndName(appId, req.getName())
            .orElse(GamifPageConfig.builder()
                .app(app)
                .publishableKey(genKey())
                .build());
 
        cfg.setName(req.getName());
        cfg.setBackgroundColor(req.getBackgroundColor());
        cfg.setPrimaryColor(req.getPrimaryColor());
        cfg.setAccentColor(req.getAccentColor());
        cfg.setTextColor(req.getTextColor());
        cfg.setCardColor(req.getCardColor());
        if (req.getBorderRadius()     != null) cfg.setBorderRadius(req.getBorderRadius());
        if (req.getDarkMode()         != null) cfg.setDarkMode(req.getDarkMode());
        if (req.getAnimate()          != null) cfg.setAnimate(req.getAnimate());
        if (req.getShowLockedBadges() != null) cfg.setShowLockedBadges(req.getShowLockedBadges());
        if (req.getBadgeColumns()     != null) cfg.setBadgeColumns(req.getBadgeColumns());
        if (req.getLeaderboardSize()  != null) cfg.setLeaderboardSize(req.getLeaderboardSize());
        if (req.getLeaderboardSortBy()!= null) cfg.setLeaderboardSortBy(req.getLeaderboardSortBy());
        if (req.getSectionsJson()     != null) cfg.setSectionsJson(req.getSectionsJson());
 
        return toResponse(repo.save(cfg));
    }
 
    // ── Dashboard: list configs for app ──────────────────────────────────────
 
    @Transactional(readOnly = true)
    public List<GamifPageConfigResponse> listForApp(Long appId) {
        return repo.findByAppId(appId).stream().map(this::toResponse).toList();
    }
 
    // ── SDK: get page config (public) ─────────────────────────────────────────
 
    @Transactional(readOnly = true)
    public GamifPageConfigResponse getPublic(String publishableKey) {
        GamifPageConfig cfg = repo.findByPublishableKey(publishableKey)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Page config not found"));
        return toResponse(cfg);
    }
 
    // ── SDK: get leaderboard for a page (public) ──────────────────────────────
 
    @Transactional(readOnly = true)
    public LeaderboardPublicDTO getLeaderboard(String publishableKey, String userId) {
        GamifPageConfig cfg = repo.findByPublishableKey(publishableKey)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Page config not found"));
 
        Long   appId   = cfg.getApp().getId();
        int    size    = Optional.ofNullable(cfg.getLeaderboardSize()).orElse(10);
        String sortBy  = Optional.ofNullable(cfg.getLeaderboardSortBy()).orElse("points");
 
        // Top N entries
        List<Object[]> rows = fetchLeaderboardRows(appId, size, 0, sortBy);
        List<LeaderboardEntryDTO> topN = rows.stream().map(this::mapEntry).toList();
        List<LeaderboardEntryDTO> top3 = topN.stream().limit(3).toList();
 
        // User rank (may be outside top N)
        LeaderboardEntryDTO userRank = null;
        if (userId != null && !userId.isBlank()) {
            userRank = findUserRank(appId, userId, sortBy);
        }
 
        long totalUsers = analyticsRepo.countLeaderboardUsers(appId);
 
        return LeaderboardPublicDTO.builder()
            .top3(top3)
            .topN(topN)
            .userRank(userRank)
            .totalUsers(totalUsers)
            .build();
    }
 
    // ── Delete ────────────────────────────────────────────────────────────────
 
    @Transactional
    public void delete(Long id) { repo.deleteById(id); }
 
    // ── Private helpers ───────────────────────────────────────────────────────
 
    private List<Object[]> fetchLeaderboardRows(Long appId, int size, int offset, String sortBy) {
        return switch (sortBy) {
            case "events" -> analyticsRepo.findLeaderboardByEvents(appId, size, offset);
            case "days"   -> analyticsRepo.findLeaderboardByDays(appId, size, offset);
            case "rules"  -> analyticsRepo.findLeaderboardByRules(appId, size, offset);
            default       -> analyticsRepo.findLeaderboardByPoints(appId, size, offset);
        };
    }
 
    private LeaderboardEntryDTO findUserRank(Long appId, String userId, String sortBy) {
        // Fetch enough rows to find the user — up to 200 (keeps DB work minimal)
        List<Object[]> rows = fetchLeaderboardRows(appId, 200, 0, sortBy);
        return rows.stream()
            .map(this::mapEntry)
            .filter(e -> userId.equals(e.getUserId()))
            .findFirst()
            .orElse(null);
    }
 
    private LeaderboardEntryDTO mapEntry(Object[] row) {
        return LeaderboardEntryDTO.builder()
            .rank(((Number) row[6]).longValue())
            .userId((String) row[0])
            .lifetimePoints(((Number) row[1]).longValue())
            .totalEvents(((Number) row[2]).longValue())
            .activeDaysCount(((Number) row[3]).longValue())
            .rulesTriggered(((Number) row[4]).longValue())
            .lastEventAt(row[5] != null
                ? ((java.sql.Timestamp) row[5]).toLocalDateTime() : null)
            .build();
    }
 
    private GamifPageConfigResponse toResponse(GamifPageConfig c) {
        String snippet = String.format(
            "GamifPage(apiKey: '%s')", c.getPublishableKey());
        return GamifPageConfigResponse.builder()
            .id(c.getId())
            .publishableKey(c.getPublishableKey())
            .name(c.getName())
            .backgroundColor(c.getBackgroundColor())
            .primaryColor(c.getPrimaryColor())
            .accentColor(c.getAccentColor())
            .textColor(c.getTextColor())
            .cardColor(c.getCardColor())
            .borderRadius(c.getBorderRadius())
            .darkMode(c.getDarkMode())
            .animate(c.getAnimate())
            .showLockedBadges(c.getShowLockedBadges())
            .badgeColumns(c.getBadgeColumns())
            .leaderboardSize(c.getLeaderboardSize())
            .leaderboardSortBy(c.getLeaderboardSortBy())
            .sectionsJson(c.getSectionsJson())
            .flutterSnippet(snippet)
            .createdAt(c.getCreatedAt())
            .updatedAt(c.getUpdatedAt())
            .build();
    }
 
    private String genKey() {
        byte[] b = new byte[24];
        rng.nextBytes(b);
        return "pk_page_" + Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
}