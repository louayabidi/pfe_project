package com.gamification.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;
import java.sql.Connection;

@RestController
public class TestController {
    
    @Autowired
    private DataSource dataSource;
    
    @GetMapping("/test")
    public String test() {
        try (Connection conn = dataSource.getConnection()) {
            return "✅ Connexion PostgreSQL réussie !";
        } catch (Exception e) {
            return "❌ Erreur : " + e.getMessage();
        }
    }
}