package com.gamification.backend.repository;

import com.gamification.backend.model.App;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * AppRepository with optimized queries for different use cases.
 * 
 * Key principle: Use JOIN FETCH to eagerly load related entities in a single query,
 * avoiding N+1 query problems and LazyInitializationException.
 */
@Repository
public interface AppRepository extends JpaRepository<App, Long> {
    
    /**
     * Find app by ID with eager loading of owner (AppOwner).
     * Use this when you need to access owner properties.
     * 
     * Query type: Single JoinFetch - loads App + AppOwner in ONE query
     * Performance: O(1) - optimal for single app lookups with owner access
     */
    @Query("SELECT a FROM App a JOIN FETCH a.owner WHERE a.id = :id")
    Optional<App> findByIdWithOwner(@Param("id") Long id);

    /**
     * Find all apps by owner ID with eager loading.
     * Use this when listing an owner's apps and accessing owner info.
     * 
     * Query type: JOIN FETCH with WHERE clause
     * Performance: O(n) - loads all apps for an owner, avoiding lazy initialization
     */
    @Query("SELECT DISTINCT a FROM App a JOIN FETCH a.owner WHERE a.owner.id = :ownerId")
    List<App> findByOwnerIdWithOwner(@Param("ownerId") Long ownerId);

    /**
     * Find app by API key with eager loading of owner.
     * Use this for public SDK calls that need to verify ownership.
     * 
     * Query type: Single JoinFetch
     * Performance: O(1) - efficient lookup with related data
     */
    @Query("SELECT a FROM App a JOIN FETCH a.owner WHERE a.apiKey = :apiKey")
    Optional<App> findByApiKeyWithOwner(@Param("apiKey") String apiKey);

    /**
     * Find apps with name and owner ID without eager loading (lightweight).
     * Use when you only need app metadata, not owner details.
     * 
     * Query type: Simple WHERE
     * Performance: O(1) - minimal data transfer
     */
    @Query("SELECT a FROM App a WHERE a.name = :name AND a.owner.id = :ownerId")
    Optional<App> findByNameAndOwnerId(@Param("name") String name, @Param("ownerId") Long ownerId);

    /**
     * Legacy methods - less optimized, use the JOIN FETCH versions above instead
     */
    
    List<App> findByOwnerId(Long ownerId);
    
    long countByOwnerId(Long ownerId);
    
    Optional<App> findByApiKey(String apiKey);
    
    boolean existsByNameAndOwnerId(String name, Long ownerId);
}