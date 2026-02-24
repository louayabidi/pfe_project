// src/main/java/com/gamification/backend/dto/app/CreateAppRequest.java
package com.gamification.backend.dto.app;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAppRequest {
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 3, max = 100, message = "Le nom doit faire entre 3 et 100 caractères")
    private String name;
    
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;
}