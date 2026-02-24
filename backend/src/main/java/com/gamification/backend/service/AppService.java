// src/main/java/com/gamification/backend/service/AppService.java
package com.gamification.backend.service;

import com.gamification.backend.dto.app.AppResponse;
import com.gamification.backend.dto.app.CreateAppRequest;
import com.gamification.backend.model.App;
import com.gamification.backend.model.AppOwner;
import com.gamification.backend.repository.AppOwnerRepository;
import com.gamification.backend.repository.AppRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppService {
    
    private final AppRepository appRepository;
    private final AppOwnerRepository ownerRepository;
    private final ApiKeyService apiKeyService;
    
    private AppOwner getCurrentOwner() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        
        log.debug("Recherche de l'owner avec email: {}", username);
        
        return ownerRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec email: " + username));
    }
    
    @Transactional
    public AppResponse createApp(CreateAppRequest request) {
        AppOwner owner = getCurrentOwner();
        log.info("Création d'application pour l'owner: {}", owner.getEmail());
        
        // Vérifier si le nom existe déjà pour cet owner
        if (appRepository.existsByNameAndOwnerId(request.getName(), owner.getId())) {
            throw new IllegalArgumentException("Une application avec ce nom existe déjà pour cet utilisateur");
        }
        
        // Générer la clé API
        String apiKey = apiKeyService.generateApiKey();
        
        // Créer l'application
        App app = App.builder()
                .name(request.getName())
                .description(request.getDescription())
                .apiKey(apiKey)
                .owner(owner)
                .active(true)
                .build();
        
        App savedApp = appRepository.save(app);
        log.info("Application créée avec ID: {}, clé API: {}", savedApp.getId(), apiKey);
        
        return mapToResponse(savedApp);
    }
    
    @Transactional(readOnly = true)
    public List<AppResponse> getMyApps() {
        AppOwner owner = getCurrentOwner();
        log.debug("Récupération des applications pour l'owner: {}", owner.getEmail());
        
        return appRepository.findByOwnerId(owner.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AppResponse getAppById(Long appId) {
        AppOwner owner = getCurrentOwner();
        
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application non trouvée avec ID: " + appId));
        
        // Vérifier que l'application appartient bien à l'owner connecté
        if (!app.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à accéder à cette application");
        }
        
        return mapToResponse(app);
    }
    
    @Transactional
    public AppResponse updateApp(Long appId, CreateAppRequest request) {
        AppOwner owner = getCurrentOwner();
        
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application non trouvée avec ID: " + appId));
        
        // Vérifier que l'application appartient bien à l'owner connecté
        if (!app.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette application");
        }
        
        // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre application du même owner
        if (!app.getName().equals(request.getName()) && 
            appRepository.existsByNameAndOwnerId(request.getName(), owner.getId())) {
            throw new IllegalArgumentException("Une application avec ce nom existe déjà");
        }
        
        app.setName(request.getName());
        app.setDescription(request.getDescription());
        
        App updatedApp = appRepository.save(app);
        log.info("Application mise à jour avec ID: {}", updatedApp.getId());
        
        return mapToResponse(updatedApp);
    }
    
    @Transactional
    public void deleteApp(Long appId) {
        AppOwner owner = getCurrentOwner();
        
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application non trouvée avec ID: " + appId));
        
        // Vérifier que l'application appartient bien à l'owner connecté
        if (!app.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette application");
        }
        
        appRepository.delete(app);
        log.info("Application supprimée avec ID: {}", appId);
    }
    
    @Transactional
    public AppResponse regenerateApiKey(Long appId) {
        AppOwner owner = getCurrentOwner();
        
        App app = appRepository.findById(appId)
                .orElseThrow(() -> new RuntimeException("Application non trouvée avec ID: " + appId));
        
        // Vérifier que l'application appartient bien à l'owner connecté
        if (!app.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à régénérer la clé API de cette application");
        }
        
        String newApiKey = apiKeyService.generateApiKey();
        app.setApiKey(newApiKey);
        
        App updatedApp = appRepository.save(app);
        log.info("Clé API régénérée pour l'application ID: {}", appId);
        
        return mapToResponse(updatedApp);
    }
    
    private AppResponse mapToResponse(App app) {
        return AppResponse.builder()
                .id(app.getId())
                .name(app.getName())
                .description(app.getDescription())
                .apiKey(app.getApiKey())
                .active(app.isActive())
                .createdAt(app.getCreatedAt())
                .build();
    }

   
public Long getCurrentAppId(String email) {
    AppOwner owner = ownerRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    
    // Récupère la première application (ou vous pouvez modifier la logique)
    return appRepository.findByOwnerId(owner.getId())
            .stream()
            .findFirst()
            .map(App::getId)
            .orElseThrow(() -> new RuntimeException("Aucune application trouvée"));
}



}