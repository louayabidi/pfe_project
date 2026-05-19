package com.gamification.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.gamification.backend.validation.StrongPassword;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    @StrongPassword(message = "Le mot de passe n'est pas suffisamment fort. Il doit contenir: majuscules, chiffres et caractères spéciaux")
    private String password;
    
    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(min = 2, message = "Le nom doit contenir au moins 2 caractères")
    private String fullName;
    
    private String companyName;
}