package com.gamification.backend.dto.event;

import java.util.Map;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrackEventRequest {

    @NotBlank(message = "L'ID utilisateur est obligatoire")
    private String userId;

    // ✅ NEW - displayName from Flutter SDK
    private String displayName;

    @NotBlank(message = "Le nom de l'événement est obligatoire")
    private String eventName;

    private Map<String, Object> data;

    // ✅ Status resolver for try-finally injection
    public String resolveStatus() {
        if (data == null) return "UNKNOWN";
        Object s = data.get("status");
        return s != null ? s.toString() : "UNKNOWN";
    }
}