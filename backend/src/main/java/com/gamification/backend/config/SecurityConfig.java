package com.gamification.backend.config;

import com.gamification.backend.filter.JwtFilter;
import com.gamification.backend.security.OAuth2SuccessHandler;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/oauth2/**").permitAll()        
                .requestMatchers("/login/oauth2/**").permitAll()
                // ── Public owner/user auth ────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()

                // ── Admin login only — management endpoints require a token ─
                .requestMatchers("/api/admin/auth/**").permitAll()
                .requestMatchers("/api/admin/**").authenticated()   
                // ── Public SDK / event endpoints ─────────────────────────
                .requestMatchers("/api/events/register").permitAll()
                .requestMatchers("/api/events/track").permitAll()
                .requestMatchers("/api/users/*/points").permitAll()
                .requestMatchers("/api/users/**").permitAll()
                .requestMatchers("/api/widgets/public/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/gamif-page/public/**").permitAll()
                .requestMatchers("/api/levels/config/**").permitAll()
                .requestMatchers("/api/streaks/config/**").permitAll()
                .requestMatchers("/api/levels/user/**").permitAll()  
                .requestMatchers("/api/streaks/user/**").permitAll() 
                .requestMatchers("/api/events/names").permitAll()
                .requestMatchers("/api/events/names/**").permitAll()
                // ── Authenticated owner endpoints ─────────────────────────
                .requestMatchers("/api/ai/**").authenticated()
                .requestMatchers("/api/gamif-page/*").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/profile/password").authenticated()
                .requestMatchers("/api/widgets/config/**").authenticated()
                .requestMatchers("/api/events/incoming/**").authenticated()

                .anyRequest().authenticated()
            )

            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

 @Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    
    config.setAllowedOriginPatterns(List.of(
        "http://localhost:*",
        "https://localhost:*",
        "http://127.0.0.1:*"
    ));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setExposedHeaders(List.of("*"));
    
    
    config.setAllowCredentials(false);  
    
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}