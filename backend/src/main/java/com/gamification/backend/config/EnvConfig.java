package com.gamification.backend.config;

import org.springframework.context.annotation.Configuration;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class EnvConfig {
    
    static {
        try {
            String envPath = System.getProperty("user.dir") + "/.env";
            Files.lines(Paths.get(envPath))
                .filter(line -> !line.trim().isEmpty() && !line.startsWith("#"))
                .forEach(line -> {
                    String[] parts = line.split("=", 2);
                    if (parts.length == 2) {
                        System.setProperty(parts[0].trim(), parts[1].trim());
                    }
                });
        } catch (IOException e) {
            System.out.println("⚠️ Warning: .env file not found. Using system environment variables.");
        }
    }
}