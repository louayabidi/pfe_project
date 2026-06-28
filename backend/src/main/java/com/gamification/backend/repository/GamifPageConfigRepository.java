package com.gamification.backend.repository;
 
import com.gamification.backend.model.GamifPageConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
 
@Repository
public interface GamifPageConfigRepository extends JpaRepository<GamifPageConfig, Long> {
    List<GamifPageConfig>   findByAppId(Long appId);
    Optional<GamifPageConfig> findByPublishableKey(String publishableKey);
    Optional<GamifPageConfig> findByAppIdAndName(Long appId, String name); // yestaamlha ki ybadel les valeurs ( couleurs ; options ..)
    void deleteByAppId(Long appId);
}