package com.gamification.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_badges")
public class UserBadge {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "badge_id", nullable = false) 
    private Long badgeId;
    
    @CreationTimestamp
    @Column(name = "awarded_at", updatable = false)
    private LocalDateTime awardedAt;
    
    @Column(name = "seen_at")
    private LocalDateTime seenAt;
}