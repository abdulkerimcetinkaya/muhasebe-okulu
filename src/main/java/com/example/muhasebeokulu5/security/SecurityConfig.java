package com.example.muhasebeokulu5.security;

import com.example.muhasebeokulu5.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService, JwtRequestFilter jwtRequestFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Static resources (Spring Boot'un varsayılan lokasyonları)
                        .requestMatchers(
                                "/static/**",                      // Static resources
                                "/public/**",                      // Public resources
                                "/resources/**",                   // Resources
                                "/META-INF/resources/**",         // META-INF resources
                                "/assets/**",                      // Assets klasörü (CSS, JS, images)
                                "/css/**",                         // CSS
                                "/js/**",                          // JavaScript
                                "/images/**",                      // Images
                                "/favicon.ico",                    // Favicon
                                "/favicon.svg",                    // SVG Favicon
                                "/robots.txt",                     // Robots.txt
                                "/sitemap.xml"                     // Sitemap
                        ).permitAll()
                        // Public endpoints (authentication gerekmez)
                        .requestMatchers(
                                "/api/auth/**",                           // Login/Register
                                "/api/problems/**",                       // Problemler API (PUBLIC - herkes görebilir)
                                "/api/solved-problems/**",                // Çözüm kontrolü API (PUBLIC - herkes kullanabilir)
                                "/api/test/**",                           // Test endpoints (development için)
                                "/api/account-plans/**",                  // Hesap planı API (PUBLIC)
                                "/api/categories",                        // Kategori listesi (PUBLIC - herkes görebilir)
                                "/api/categories/*",                      // Kategori detayı (PUBLIC)
                                "/api/quizzes",                           // Quiz listesi (PUBLIC - herkes görebilir)
                                "/api/quizzes/*",                         // Quiz detayı (PUBLIC)
                                "/api/study-cards/**",                    // Study cards API (controller handles auth)
                                "/actuator/**",                           // Actuator endpoints (development için)
                                "/*.html",                                // Root level HTML dosyaları
                                "/h2-console/**"                          // H2 Console (development için)
                        ).permitAll()
                        // Users API endpointleri authentication gerektirir
                        .requestMatchers("/api/users/**").authenticated()
                        // Quiz submission ve user quiz endpointleri authentication gerektirir
                        .requestMatchers("/api/quizzes/submit", "/api/quizzes/users/**").authenticated()
                        // Admin endpointleri authentication gerektirir
                        .requestMatchers("/api/admin/**").authenticated()
                        .requestMatchers("/api/correct-entries/**").authenticated()
                        // Diğer tüm endpointler authentication gerektirir
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        // H2 Console için frame options disabled (sadece development)
        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:63342",
                "http://localhost:63343",
                "http://localhost:8080",
                "http://192.168.1.36:63342",
                "http://127.0.0.1:63342",
                "http://127.0.0.1:63343"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}