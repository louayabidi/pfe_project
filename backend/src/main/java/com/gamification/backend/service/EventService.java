package com.gamification.backend.service;

import com.gamification.backend.dto.event.EventFilterRequest;
import com.gamification.backend.dto.event.IncomingEventDTO;
import com.gamification.backend.dto.event.TrackEventRequest;
import com.gamification.backend.model.App;
import com.gamification.backend.model.IncomingEvent;
import com.gamification.backend.model.RegisteredEvent;
import com.gamification.backend.repository.AppRepository;
import com.gamification.backend.repository.IncomingEventRepository;
import com.gamification.backend.repository.RegisteredEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;           // ✅ correct
import org.springframework.data.domain.PageRequest;    // ✅ correct
import org.springframework.data.domain.Pageable;       // ✅ correct
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {

    private final IncomingEventRepository incomingEventRepository; 
    private final RegisteredEventRepository registeredEventRepository;
    private final AppRepository appRepository;

    @Transactional
    public void saveEvent(App app, TrackEventRequest request) {
        IncomingEvent event = IncomingEvent.builder()
                .app(app)
                .userId(request.getUserId())
                .eventName(request.getEventName())
                .eventData(request.getData())
                .processed(false)
                .build();

        incomingEventRepository.save(event);
        log.info("Événement sauvegardé: {} pour l'utilisateur {}",
                request.getEventName(), request.getUserId());
    }

    @Transactional
    public void registerEvents(String apiKey, List<String> eventNames) {
        App app = appRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new RuntimeException("API Key invalide"));

        eventNames.forEach(eventName -> {
            if (!registeredEventRepository.existsByAppIdAndEventName(
                    app.getId(), eventName)) {
                registeredEventRepository.save(
                    RegisteredEvent.builder()
                        .app(app)
                        .eventName(eventName)
                        .build()
                );
            }
        });

        log.info("{} events enregistrés pour app {}", eventNames.size(), app.getName());
    }

    public List<String> getRegisteredEvents(Long appId) {
        return registeredEventRepository.findByAppId(appId)
                .stream()
                .map(RegisteredEvent::getEventName)
                .collect(Collectors.toList());
    }

public Page<IncomingEventDTO> getIncomingEvents(Long appId, EventFilterRequest filter) {
    LocalDateTime from = filter.getDateFrom() != null
            ? filter.getDateFrom().atStartOfDay() : null;
    LocalDateTime to = filter.getDateTo() != null
            ? filter.getDateTo().atTime(23, 59, 59) : null;

    Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize());

    boolean hasUserId    = filter.getUserId() != null
                           && !filter.getUserId().isBlank();
    boolean hasEventName = filter.getEventName() != null
                           && !filter.getEventName().isBlank();
    boolean hasFrom      = from != null;
    boolean hasTo        = to   != null;

    // Si aucun filtre → requête simple sans paramètres null

    if (!hasUserId && !hasEventName && !hasFrom && !hasTo) {
        return incomingEventRepository
            .findByAppIdOrderByCreatedAtDesc(appId, pageable)
            .map(this::toDTO);
    }

    return incomingEventRepository.findWithFilters(
            appId,
            hasUserId    ? filter.getUserId()    : null,
            hasEventName ? filter.getEventName() : null,
            hasFrom      ? from                  : null,
            hasTo        ? to                    : null,
            pageable
    ).map(this::toDTO);
}

    public List<String> getDistinctUsers(Long appId) {
        return incomingEventRepository.findDistinctUserIdsByAppId(appId);
    }

    public List<String> getDistinctEventNames(Long appId) {
        return incomingEventRepository.findDistinctEventNamesByAppId(appId);
    }

    private IncomingEventDTO toDTO(IncomingEvent e) {
        return IncomingEventDTO.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .eventName(e.getEventName())
                .eventData(e.getEventData())
                .processed(e.getProcessed())
                .createdAt(e.getCreatedAt())
                .build();
    }
}