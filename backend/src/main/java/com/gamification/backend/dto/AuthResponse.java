package com.gamification.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    
    private Long id;
    private String email;
    private String fullName;
    private String companyName;
    private String message;
    private boolean verified;
    private String token; 
}