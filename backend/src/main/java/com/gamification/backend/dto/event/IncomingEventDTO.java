package com.gamification.backend.dto.event;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class IncomingEventDTO {
    private Long id;
    private String userId;
    private String eventName;
    private String displayName; 
    private Map<String, Object> eventData;
    private Boolean processed;
    private LocalDateTime createdAt;
}