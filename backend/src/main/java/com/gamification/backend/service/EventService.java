package com.gamification.backend.service;

import com.gamification.backend.dto.event.TrackEventRequest;
import com.gamification.backend.model.App;
import com.gamification.backend.model.IncomingEvent;
import com.gamification.backend.repository.IncomingEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.gamification.backend.model.RegisteredEvent;
import com.gamification.backend.repository.RegisteredEventRepository;
import com.gamification.backend.repository.AppRepository;


@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {
    
    private final IncomingEventRepository eventRepository;
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
        
        eventRepository.save(event);
        log.info("Événement sauvegardé: {} pour l'utilisateur {}", request.getEventName(), request.getUserId());
    }

// Appelé par le scanner pour enregistrer les méthodes choisies
public void registerEvents(String apiKey, List<String> eventNames) {
    App app = appRepository.findByApiKey(apiKey)
        .orElseThrow(() -> new RuntimeException("API Key invalide"));

    for (String eventName : eventNames) {
        if (!registeredEventRepository.existsByAppIdAndEventName(
                app.getId(), eventName)) {
            RegisteredEvent event = RegisteredEvent.builder()
                .app(app)
                .eventName(eventName)
                .build();
            registeredEventRepository.save(event);
        }
    }
    log.info("{} events enregistrés pour app {}", eventNames.size(), app.getName());
}

// Appelé par le dashboard pour afficher les events disponibles
public List<String> getRegisteredEvents(Long appId) {
    return registeredEventRepository.findByAppId(appId)
        .stream()
        .map(RegisteredEvent::getEventName)
        .collect(Collectors.toList());
}


}