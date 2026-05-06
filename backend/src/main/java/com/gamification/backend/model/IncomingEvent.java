package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "incoming_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_id", nullable = false)
    private App app;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = true)
    private String displayName;

    @Column(nullable = false)
    private String eventName;

    @Column(columnDefinition = "jsonb")
    private Map<String, Object> eventData;

    @Column(nullable = false)
    @Builder.Default
    private Boolean processed = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}