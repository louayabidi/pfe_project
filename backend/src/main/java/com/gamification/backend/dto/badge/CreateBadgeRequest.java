package com.gamification.backend.dto.badge;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateBadgeRequest {
    
    @NotBlank(message = "Le nom du badge est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit faire entre 2 et 100 caractères")
    private String name;
    
    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;
    
    private String imageUrl;
    
    private Boolean hidden = false;
    
    private Integer maxAwardsPerUser;
}