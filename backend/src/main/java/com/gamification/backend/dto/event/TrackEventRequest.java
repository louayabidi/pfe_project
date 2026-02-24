package com.gamification.backend.dto.event;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class TrackEventRequest {
    
    @NotBlank(message = "L'ID utilisateur est obligatoire")
    private String userId;
    
    @NotBlank(message = "Le nom de l'événement est obligatoire")
    private String eventName;
    
    private Map<String, Object> data;
}