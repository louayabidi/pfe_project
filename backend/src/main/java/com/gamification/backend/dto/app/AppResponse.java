
package com.gamification.backend.dto.app;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AppResponse {
    private Long id;
    private String name;
    private String description;
    private String apiKey;
    private boolean active;
    private LocalDateTime createdAt;
}