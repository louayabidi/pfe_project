package com.gamification.backend.dto.admin;

import com.gamification.backend.model.Admin;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserResponse {
    private Long            id;
    private String          email;
    private String          fullName;
    private Admin.AdminRole role;
    private Boolean         active;
    private LocalDateTime   createdAt;
    private LocalDateTime   lastLogin;
}