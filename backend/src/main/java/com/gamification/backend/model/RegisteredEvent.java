package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registered_events")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegisteredEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "app_id")
    private App app;

    private String eventName;

    @Builder.Default
    private LocalDateTime registeredAt = LocalDateTime.now();
}