package com.gamification.backend.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyOwnerRequest {
    @NotNull(message = "Le statut de vérification est obligatoire")
    private Boolean verify;
}