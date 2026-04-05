package com.gamification.backend.dto.event;

import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrackEventRequest {

    @NotBlank(message = "L'ID utilisateur est obligatoire")
    private String userId;

    @NotBlank(message = "Le nom de l'événement est obligatoire")
    private String eventName;

    private Map<String, Object> data;

    // ✅ NOUVEAU — envoyé par le SDK via data.status
    // On le lit depuis data pour ne pas casser le contrat existant
    public String resolveStatus() {
        if (data == null) return "UNKNOWN";
        Object s = data.get("status");
        return s != null ? s.toString() : "UNKNOWN";
    }
}