package com.example.muhasebeokulu5.security;

import com.example.muhasebeokulu5.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtRequestFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String requestURI = request.getRequestURI();
        final String authorizationHeader = request.getHeader("Authorization");

        // Debug logging
        logger.info("=== JWT Filter START ===");
        logger.info("Request URI: " + requestURI);
        logger.info("Authorization header: " + (authorizationHeader != null ? "Present" : "Missing"));

        String username = null;
        String jwt = null;

        // Bearer token kontrolü
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            logger.info("JWT token extracted successfully, length: " + jwt.length());
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.info("Username extracted from JWT: " + username);
            } catch (Exception e) {
                logger.error("ERROR extracting username from JWT: " + e.getMessage(), e);
            }
        } else {
            logger.warn("No Bearer token in Authorization header");
        }

        // Token valid ise kullanıcıyı authenticate et
        if (username != null) {
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                try {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                    logger.info("UserDetails loaded successfully for: " + username);

                    if (jwtUtil.validateToken(jwt, userDetails.getUsername())) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        logger.info("✓ Authentication SUCCESS - User authenticated: " + username);
                    } else {
                        logger.error("✗ JWT validation FAILED for user: " + username);
                    }
                } catch (Exception e) {
                    logger.error("✗ ERROR during authentication: " + e.getMessage(), e);
                }
            } else {
                logger.info("Authentication already exists in SecurityContext");
            }
        } else {
            logger.warn("Username is null - cannot authenticate");
        }

        logger.info("=== JWT Filter END ===");
        chain.doFilter(request, response);
    }
}