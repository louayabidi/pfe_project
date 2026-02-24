package com.gamification.backend.repository;

import com.gamification.backend.model.AppOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppOwnerRepository extends JpaRepository<AppOwner, Long> {
    
    Optional<AppOwner> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Optional<AppOwner> findByVerificationToken(String token);
}