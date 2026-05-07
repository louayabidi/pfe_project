package com.gamification.backend.dto.admin;

import com.gamification.backend.model.Admin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminAuthResponse {

    private Long           id;
    private String         email;
    private String         fullName;
    private Admin.AdminRole role;
    private String         token;
    private String         message;
}