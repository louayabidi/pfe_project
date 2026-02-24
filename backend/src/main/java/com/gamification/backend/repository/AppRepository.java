// src/main/java/com/gamification/backend/repository/AppRepository.java
package com.gamification.backend.repository;

import com.gamification.backend.model.App;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppRepository extends JpaRepository<App, Long> {
    
    List<App> findByOwnerId(Long ownerId);
    
    Optional<App> findByApiKey(String apiKey);
    
    boolean existsByNameAndOwnerId(String name, Long ownerId);
}