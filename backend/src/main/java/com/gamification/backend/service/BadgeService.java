package com.gamification.backend.service;

import com.gamification.backend.dto.badge.BadgeResponse;
import com.gamification.backend.dto.badge.CreateBadgeRequest;
import com.gamification.backend.model.App;
import com.gamification.backend.model.Badge;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {
    
    private final BadgeRepository badgeRepository;
    private final AppRepository appRepository;
    
    @Transactional
    public BadgeResponse createBadge(Long appId, CreateBadgeRequest request) {
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application non trouvée"));
        
        if (badgeRepository.existsByNameAndAppId(request.getName(), appId)) {
            throw new RuntimeException("Un badge avec ce nom existe déjà");
        }
        
        Badge badge = Badge.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .hidden(request.getHidden() != null ? request.getHidden() : false)
                .maxAwardsPerUser(request.getMaxAwardsPerUser())
                .app(app)
                .build();
        
        Badge savedBadge = badgeRepository.save(badge);
        log.info("Badge créé: {} pour l'app {}", savedBadge.getName(), appId);
        
        return mapToResponse(savedBadge);
    }
    
    public List<BadgeResponse> getBadgesByAppId(Long appId) {
        return badgeRepository.findByAppId(appId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public BadgeResponse getBadge(Long badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge non trouvé"));
        return mapToResponse(badge);
    }
    
    @Transactional
    public void deleteBadge(Long badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge non trouvé"));
        badgeRepository.delete(badge);
        log.info("Badge supprimé: {}", badgeId);
    }
    
    private BadgeResponse mapToResponse(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .imageUrl(badge.getImageUrl())
                .hidden(badge.getHidden())
                .maxAwardsPerUser(badge.getMaxAwardsPerUser())
                .createdAt(badge.getCreatedAt())
                .build();
    }
}