package com.gamification.backend.service;

import com.gamification.backend.dto.event.TrackEventRequest;
import com.gamification.backend.model.App;
import com.gamification.backend.model.IncomingEvent;
import com.gamification.backend.repository.IncomingEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventService {
    
    private final IncomingEventRepository eventRepository;
    
    
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
}