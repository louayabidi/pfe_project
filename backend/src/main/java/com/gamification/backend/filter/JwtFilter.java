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

    // List of public endpoints that don't require authentication
    private static final List<String> PUBLIC_PATHS = List.of(
        "/api/auth/",
        "/api/admin/auth/", 
       // "/api/events/register",
        "/api/events/track",
        "/api/events/names",
        
         "/api/widgets/public/",    // ← plural with trailing slash
    "/api/users/",             // ← this should allow profile endpoint
    "/api/gamif-page/public/",
      "/api/levels/config/",      
    "/api/streaks/config/" ,
    "/api/levels/user/",    
"/api/streaks/user/"    ,
"/oauth2/",         
    "/login/oauth2/" 
       
    );

    @Override
protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
    String path = request.getRequestURI();
    String method = request.getMethod();
    
    if ("OPTIONS".equalsIgnoreCase(method)) return true;
    
    return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
}

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        System.out.println("=== JWT Filter ===");
        System.out.println("URL    : " + request.getRequestURI());
        System.out.println("Method : " + request.getMethod());

        String authHeader = request.getHeader("Authorization");
        System.out.println("Header : " + authHeader);

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
            System.out.println("Auth dans context : " + SecurityContextHolder.getContext().getAuthentication());
        } else {
            System.out.println("❌ Token invalide");
        }

        filterChain.doFilter(request, response);
    }
}