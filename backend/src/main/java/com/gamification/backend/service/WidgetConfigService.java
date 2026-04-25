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
    private final AppRepository          appRepository;
    private final SecureRandom           secureRandom = new SecureRandom();

    // ── CREATE OR UPDATE ─────────────────────────────────────────────────────

    @Transactional
    public WidgetConfigResponse createOrUpdateConfig(Long appId, WidgetConfigRequest req) {
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("App not found"));

        // Reuse existing config for this app+name, or create a new one
        WidgetConfig config = widgetConfigRepository
                .findByAppIdAndName(appId, req.getName())
                .orElse(WidgetConfig.builder()
                        .app(app)
                        .publishableKey(generatePublishableKey())
                        .build());

        // ── Scalar fields ──────────────────────────────────────────────────
        config.setName(req.getName());
        config.setDisplayMode(req.getDisplayMode());
        config.setContentMode(req.getContentMode());
        config.setBackgroundColor(req.getBackgroundColor());
        config.setTextColor(req.getTextColor());
        config.setAccentColor(req.getAccentColor());
        config.setLabel(req.getLabel());
        config.setShowLifetime(req.getShowLifetime());
        config.setShowLevel(req.getShowLevel());
        config.setAnimate(req.getAnimate());
        config.setBorderRadius(req.getBorderRadius());
        config.setFontFamily(req.getFontFamily());
        config.setDarkMode(req.getDarkMode());
        config.setLanguage(req.getLanguage());

        // ── Canvas layout (from Widget Studio drag-and-drop) ───────────────
        if (req.getLayoutJson() != null) {
            config.setLayoutJson(req.getLayoutJson());
        }

        return toResponse(widgetConfigRepository.save(config));
    }

    // ── READ ─────────────────────────────────────────────────────────────────

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

    // ── PRIVATE ──────────────────────────────────────────────────────────────

    private WidgetConfigResponse toResponse(WidgetConfig c) {
        return WidgetConfigResponse.builder()
                .id(c.getId())
                .publishableKey(c.getPublishableKey())
                .name(c.getName())
                .displayMode(c.getDisplayMode())
                .contentMode(c.getContentMode())
                .backgroundColor(c.getBackgroundColor())
                .textColor(c.getTextColor())
                .accentColor(c.getAccentColor())
                .label(c.getLabel())
                .showLifetime(c.getShowLifetime())
                .showLevel(c.getShowLevel())
                .animate(c.getAnimate())
                .borderRadius(c.getBorderRadius())
                .fontFamily(c.getFontFamily())
                .darkMode(c.getDarkMode())
                .language(c.getLanguage())
                .layoutJson(c.getLayoutJson())          // ← send canvas to SDK
                .generatedCode(String.format(
                        "GamifWidget(apiKey: '%s')", c.getPublishableKey()))
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private String generatePublishableKey() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return "pk_live_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}