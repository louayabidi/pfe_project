
package com.gamification.backend.service;

import com.gamification.backend.dto.widget.WidgetConfigRequest;
import com.gamification.backend.dto.widget.WidgetConfigResponse;
import com.gamification.backend.model.App;
import com.gamification.backend.model.WidgetConfig;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.WidgetConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WidgetConfigService {
    
    private final WidgetConfigRepository widgetConfigRepository;
    private final AppRepository appRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    
    @Transactional
    public WidgetConfigResponse createOrUpdateConfig(Long appId, WidgetConfigRequest request) {
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("App not found"));
        
        WidgetConfig config = widgetConfigRepository.findByAppIdAndName(appId, request.getName())
                .orElse(WidgetConfig.builder()
                        .app(app)
                        .publishableKey(generatePublishableKey())
                        .build());
        
        // Update fields
        config.setName(request.getName());
        config.setDisplayMode(request.getDisplayMode());
        config.setContentMode(request.getContentMode());
        config.setBackgroundColor(request.getBackgroundColor());
        config.setTextColor(request.getTextColor());
        config.setAccentColor(request.getAccentColor());
        config.setLabel(request.getLabel());
        config.setShowLifetime(request.getShowLifetime());
        config.setShowLevel(request.getShowLevel());
        config.setAnimate(request.getAnimate());
        config.setBorderRadius(request.getBorderRadius());
        config.setFontFamily(request.getFontFamily());
        config.setDarkMode(request.getDarkMode());
        config.setLanguage(request.getLanguage());
        
        WidgetConfig saved = widgetConfigRepository.save(config);
        return toResponse(saved);
    }
    
    public WidgetConfigResponse getConfig(String publishableKey) {
        WidgetConfig config = widgetConfigRepository.findByPublishableKey(publishableKey)
                .orElseThrow(() -> new RuntimeException("Widget config not found"));
        return toResponse(config);
    }
    
    public List<WidgetConfigResponse> getAppConfigs(Long appId) {
        return widgetConfigRepository.findByAppId(appId).stream()
                .map(this::toResponse)
                .toList();
    }
    
    private WidgetConfigResponse toResponse(WidgetConfig config) {
        String generatedCode = String.format(
            "GamifWidget(apiKey: '%s')",
            config.getPublishableKey()
        );
        
        return WidgetConfigResponse.builder()
                .id(config.getId())
                .publishableKey(config.getPublishableKey())
                .name(config.getName())
                .displayMode(config.getDisplayMode())
                .contentMode(config.getContentMode())
                .backgroundColor(config.getBackgroundColor())
                .textColor(config.getTextColor())
                .accentColor(config.getAccentColor())
                .label(config.getLabel())
                .showLifetime(config.getShowLifetime())
                .showLevel(config.getShowLevel())
                .animate(config.getAnimate())
                .borderRadius(config.getBorderRadius())
                .fontFamily(config.getFontFamily())
                .darkMode(config.getDarkMode())
                .language(config.getLanguage())
                .generatedCode(generatedCode)
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
    
    private String generatePublishableKey() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return "pk_live_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}