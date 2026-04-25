package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_action_log")
public class AiActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "app_id", nullable = false)
    private Long appId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "segment", nullable = false)
    private String segment;

    @Column(name = "action_type", nullable = false)
    private String actionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "action_payload")
    private Map<String, Object> actionPayload;

    @CreationTimestamp
    @Column(name = "fired_at", nullable = false, updatable = false)
    private LocalDateTime firedAt;

    @Column(name = "outcome_checked_at")
    private LocalDateTime outcomeCheckedAt;

    @Column(name = "did_return")
    private Boolean didReturn;

    @Column(name = "did_act")
    private Boolean didAct;
}