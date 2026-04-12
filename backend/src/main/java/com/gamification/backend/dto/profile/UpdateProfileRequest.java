package com.gamification.backend.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(min = 2, max = 100)
    private String fullName;

    @Size(max = 100)
    private String companyName;
}