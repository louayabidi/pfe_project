package com.gamification.backend.repository;

import com.gamification.backend.model.AppOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppOwnerRepository extends JpaRepository<AppOwner, Long> {

    Optional<AppOwner> findByEmail(String email);

    Optional<AppOwner> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    long countByActive(Boolean active);

    long countByVerified(Boolean verified);
}