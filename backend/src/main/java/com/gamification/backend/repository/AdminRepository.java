package com.gamification.backend.repository;

import com.gamification.backend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    
    Optional<Admin> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<Admin> findByActive(Boolean active);
    
    long countByRole(Admin.AdminRole role);
}