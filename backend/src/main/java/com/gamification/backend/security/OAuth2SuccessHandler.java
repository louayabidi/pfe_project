package com.gamification.backend.security;

import com.gamification.backend.model.AppOwner;
import com.gamification.backend.repository.AppOwnerRepository;
import com.gamification.backend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AppOwnerRepository ownerRepository;
    private final JwtService jwtService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String googleId  = oauthUser.getAttribute("sub");       // Google's unique user ID
        String email     = oauthUser.getAttribute("email");
        String fullName  = oauthUser.getAttribute("name");
        String picture   = oauthUser.getAttribute("picture");

        log.info("OAuth2 login for email: {}", email);

        // Find by googleId first, then fall back to email (handles existing local accounts)
        AppOwner owner = ownerRepository.findByGoogleId(googleId)
                .orElseGet(() -> ownerRepository.findByEmail(email)
                        .map(existing -> linkGoogleToExisting(existing, googleId, picture))
                        .orElseGet(() -> registerNewGoogleUser(googleId, email, fullName, picture)));

        // Update last login
        owner.setLastLogin(LocalDateTime.now());
        ownerRepository.save(owner);

        // Generate your existing JWT
        String token = jwtService.generateToken(owner.getEmail());

        // Redirect to frontend with token — Angular picks it up from query param
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + token;
        log.info("Redirecting to: {}", redirectUrl);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    // ── Link Google ID to an existing local account ───────────────────────────
    private AppOwner linkGoogleToExisting(AppOwner owner, String googleId, String picture) {
        log.info("Linking Google ID to existing account: {}", owner.getEmail());
        owner.setGoogleId(googleId);
        owner.setAuthProvider("AUTH_GOOGLE");
        if (owner.getPictureUrl() == null) {
            owner.setPictureUrl(picture);
        }
        // Google-verified emails are trusted — mark as verified
        owner.setVerified(true);
        return ownerRepository.save(owner);
    }

    // ── Create a brand-new account from Google data ───────────────────────────
    private AppOwner registerNewGoogleUser(String googleId, String email,
                                           String fullName, String picture) {
        log.info("Auto-registering new Google user: {}", email);
        AppOwner newOwner = AppOwner.builder()
                .email(email)
                .fullName(fullName)
                .pictureUrl(picture)
                .googleId(googleId)
                .authProvider("AUTH_GOOGLE")
                .password(null)          // no password for OAuth users
                .verified(true)          // Google already verified the email
                .active(true)
                .build();
        return ownerRepository.save(newOwner);
    }
}