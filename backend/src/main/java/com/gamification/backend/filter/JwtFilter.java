package com.gamification.backend.filter;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gamification.backend.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ── LOGS TEMPORAIRES ──────────────────────────
        System.out.println("=== JWT Filter ===");
        System.out.println("URL    : " + request.getRequestURI());
        System.out.println("Method : " + request.getMethod());

        String authHeader = request.getHeader("Authorization");
        System.out.println("Header : " + authHeader);
        // ─────────────────────────────────────────────

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("❌ Pas de token Bearer");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        boolean valid = jwtService.isTokenValid(token);
        System.out.println("Valid  : " + valid);

        if (valid) {
            String email = jwtService.extractEmail(token);
            System.out.println("Email  : " + email);
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(email, null, List.of());
            SecurityContextHolder.getContext().setAuthentication(auth);
            System.out.println("✅ Authentifié !");
                System.out.println("Auth dans context : " + SecurityContextHolder.getContext().getAuthentication()); // ← ajoute ça

            
        } else {
            System.out.println("❌ Token invalide");
        }

        filterChain.doFilter(request, response);
    }
}