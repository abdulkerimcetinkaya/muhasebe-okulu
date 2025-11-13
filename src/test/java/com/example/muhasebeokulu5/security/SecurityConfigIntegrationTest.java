package com.example.muhasebeokulu5.security;

import com.example.muhasebeokulu5.entities.Role;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("SecurityConfig Integration Tests - Authorization Rules")
class SecurityConfigIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private String validToken;
    private String expiredToken;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password123"));
        testUser.setRole(Role.USER);
        testUser.setTotalScore(0);
        testUser.setSolvedCount(0);
        testUser.setTotalStars(0);
        testUser.setBonusStars(0);
        testUser.setCurrentStreak(0);
        testUser.setBestStreak(0);
        userRepository.save(testUser);

        // Generate valid token
        validToken = jwtUtil.generateToken(testUser.getId(), testUser.getUsername(), testUser.getRole().name());

        // Generate expired token (for expiry tests)
        // Note: This is a mock - in real scenario you'd need to manipulate time or create token with past expiry
        expiredToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTYwMDAwMDAwMH0.invalid";
    }

    // ==================== STUDY CARDS AUTHORIZATION TESTS ====================

    @Test
    @DisplayName("StudyCards: Public endpoints (list/detail) - 200 OK kimlik doğrulama olmadan")
    void testStudyCards_PublicEndpoints_ShouldBeAccessibleWithoutAuth() throws Exception {
        // Study cards list - PUBLIC
        mockMvc.perform(get("/api/study-cards"))
                .andExpect(status().isOk());

        // Study card sections - PUBLIC
        mockMvc.perform(get("/api/study-cards/{id}/sections", 1L))
                .andExpect(status().isOk());

        // Section detail - PUBLIC
        mockMvc.perform(get("/api/study-cards/sections/{id}", 1L))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("StudyCards: Progress endpoints kimlik doğrulama olmadan - 401 Unauthorized")
    void testStudyCards_ProgressEndpoints_WithoutAuth_ShouldReturn401() throws Exception {
        // Start section - AUTHENTICATED
        mockMvc.perform(post("/api/study-cards/sections/{id}/start", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());

        // Complete section - AUTHENTICATED
        mockMvc.perform(post("/api/study-cards/sections/{id}/complete", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());

        // Get card progress - AUTHENTICATED
        mockMvc.perform(get("/api/study-cards/{id}/progress", 1L))
                .andExpect(status().isUnauthorized());

        // Get user progress - AUTHENTICATED
        mockMvc.perform(get("/api/study-cards/progress"))
                .andExpect(status().isUnauthorized());

        // Get section progress - AUTHENTICATED
        mockMvc.perform(get("/api/study-cards/sections/{id}/progress", 1L))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("StudyCards: Progress endpoints geçerli token ile - 200/404 dönmeli (401 değil)")
    void testStudyCards_ProgressEndpoints_WithValidToken_ShouldNotReturn401() throws Exception {
        // Get user progress - AUTHENTICATED
        mockMvc.perform(get("/api/study-cards/progress")
                .header("Authorization", "Bearer " + validToken))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401

        // Get section progress - AUTHENTICATED
        mockMvc.perform(get("/api/study-cards/sections/{id}/progress", 1L)
                .header("Authorization", "Bearer " + validToken))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401
    }

    // ==================== PROBLEMS API AUTHORIZATION TESTS ====================

    @Test
    @DisplayName("Problems: Public endpoints - kimlik doğrulama olmadan erişilebilmeli")
    void testProblems_PublicEndpoints_ShouldBeAccessibleWithoutAuth() throws Exception {
        // Problems list - PUBLIC
        mockMvc.perform(get("/api/problems"))
                .andExpect(status().isOk());

        // Problem detail - PUBLIC
        mockMvc.perform(get("/api/problems/{id}", 1L))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SolvedProblems: Solution checking - kimlik doğrulama olmadan erişilebilmeli")
    void testSolvedProblems_CheckSolution_ShouldBePublic() throws Exception {
        // Check solution - PUBLIC
        String requestBody = """
            {
                "problemId": 1,
                "userId": "%s",
                "entries": [
                    {"accountCode": "100", "debit": 100, "credit": 0},
                    {"accountCode": "320", "debit": 0, "credit": 100}
                ]
            }
            """.formatted(testUser.getId());

        mockMvc.perform(post("/api/solved-problems/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401 (may be 200 or 400 depending on data)
    }

    // ==================== QUIZZES AUTHORIZATION TESTS ====================

    @Test
    @DisplayName("Quizzes: List ve detail endpoints - PUBLIC")
    void testQuizzes_ListAndDetail_ShouldBePublic() throws Exception {
        // Quiz list - PUBLIC
        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk());

        // Quiz detail - PUBLIC
        mockMvc.perform(get("/api/quizzes/{id}", 1L))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Quizzes: Submit endpoint kimlik doğrulama olmadan - 401 Unauthorized")
    void testQuizzes_Submit_WithoutAuth_ShouldReturn401() throws Exception {
        // Submit quiz - AUTHENTICATED
        String requestBody = """
            {
                "quizId": 1,
                "userId": "%s",
                "answers": []
            }
            """.formatted(testUser.getId());

        mockMvc.perform(post("/api/quizzes/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Quizzes: Completed quizzes endpoint kimlik doğrulama olmadan - 401 Unauthorized")
    void testQuizzes_CompletedQuizzes_WithoutAuth_ShouldReturn401() throws Exception {
        // Get completed quizzes - AUTHENTICATED
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", testUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Quizzes: Submit ve completed endpoints geçerli token ile - erişilebilmeli")
    void testQuizzes_ProtectedEndpoints_WithValidToken_ShouldBeAccessible() throws Exception {
        // Submit quiz - AUTHENTICATED
        String submitRequest = """
            {
                "quizId": 1,
                "userId": "%s",
                "answers": []
            }
            """.formatted(testUser.getId());

        mockMvc.perform(post("/api/quizzes/submit")
                .header("Authorization", "Bearer " + validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(submitRequest))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401

        // Get completed quizzes - AUTHENTICATED
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", testUser.getId())
                .header("Authorization", "Bearer " + validToken))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401
    }

    // ==================== USERS API AUTHORIZATION TESTS ====================

    @Test
    @DisplayName("Users: Profile endpoints kimlik doğrulama olmadan - 401 Unauthorized")
    void testUsers_ProfileEndpoints_WithoutAuth_ShouldReturn401() throws Exception {
        // Get user profile - AUTHENTICATED
        mockMvc.perform(get("/api/users/{id}", testUser.getId()))
                .andExpect(status().isUnauthorized());

        // Update user profile - AUTHENTICATED
        mockMvc.perform(put("/api/users/{id}", testUser.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Users: Profile endpoints geçerli token ile - erişilebilmeli")
    void testUsers_ProfileEndpoints_WithValidToken_ShouldBeAccessible() throws Exception {
        // Get user profile - AUTHENTICATED
        mockMvc.perform(get("/api/users/{id}", testUser.getId())
                .header("Authorization", "Bearer " + validToken))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401
    }

    // ==================== ADMIN ENDPOINTS AUTHORIZATION TESTS ====================

    @Test
    @DisplayName("Admin: Admin endpoints kimlik doğrulama olmadan - 401 Unauthorized")
    void testAdmin_Endpoints_WithoutAuth_ShouldReturn401() throws Exception {
        // Admin dashboard - AUTHENTICATED (and requires ADMIN role)
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());

        // Admin problem management - AUTHENTICATED
        mockMvc.perform(get("/api/admin/problems"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Admin: USER rolü ile admin endpoint - 403 Forbidden (Authorization !== Authentication)")
    void testAdmin_Endpoints_WithUserRole_ShouldReturn403() throws Exception {
        // USER role trying to access admin endpoints
        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", "Bearer " + validToken))
                .andExpect(status().isForbidden()); // 403 - authorized but not authorized (role check fails)
    }

    // ==================== ACCOUNT PLANS AUTHORIZATION TESTS ====================

    @Test
    @DisplayName("AccountPlans: Public access - kimlik doğrulama olmadan erişilebilmeli")
    void testAccountPlans_PublicAccess_ShouldWork() throws Exception {
        // Account plans - PUBLIC
        mockMvc.perform(get("/api/account-plans"))
                .andExpect(status().isOk());

        // Account plan detail - PUBLIC
        mockMvc.perform(get("/api/account-plans/{id}", 1L))
                .andExpect(status().isOk());
    }

    // ==================== STATIC RESOURCES AUTHORIZATION TESTS ====================

    @Test
    @DisplayName("Static: HTML sayfaları - kimlik doğrulama olmadan erişilebilmeli")
    void testStatic_HtmlPages_ShouldBePublic() throws Exception {
        // Root HTML pages - PUBLIC
        mockMvc.perform(get("/index.html"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/login.html"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/register.html"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Static: Assets (CSS/JS) - kimlik doğrulama olmadan erişilebilmeli")
    void testStatic_Assets_ShouldBePublic() throws Exception {
        // CSS files - PUBLIC
        mockMvc.perform(get("/assets/css/tailwind.min.css"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401 (may be 200 or 404)

        // JS files - PUBLIC
        mockMvc.perform(get("/assets/js/common.js"))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401
    }

    // ==================== JWT TOKEN VALIDATION TESTS ====================

    @Test
    @DisplayName("JWT: Geçersiz token - 401 Unauthorized")
    void testJwt_InvalidToken_ShouldReturn401() throws Exception {
        // Invalid token format
        mockMvc.perform(get("/api/study-cards/progress")
                .header("Authorization", "Bearer invalid-token-format"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT: Bearer prefix olmadan - 401 Unauthorized")
    void testJwt_MissingBearerPrefix_ShouldReturn401() throws Exception {
        // Missing "Bearer " prefix
        mockMvc.perform(get("/api/study-cards/progress")
                .header("Authorization", validToken))  // Missing "Bearer " prefix
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT: Authorization header olmadan korumalı endpoint - 401 Unauthorized")
    void testJwt_MissingAuthHeader_ShouldReturn401() throws Exception {
        // No Authorization header at all
        mockMvc.perform(get("/api/study-cards/progress"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT: Geçerli token ile korumalı endpoint - erişilebilmeli")
    void testJwt_ValidToken_ShouldAccessProtectedEndpoint() throws Exception {
        // Valid token accessing protected endpoint
        mockMvc.perform(get("/api/users/{id}", testUser.getId())
                .header("Authorization", "Bearer " + validToken))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isNotEqualTo(401)); // Should NOT be 401
    }

    // ==================== CORS CONFIGURATION TESTS ====================

    @Test
    @DisplayName("CORS: Allowed origins - OPTIONS request başarılı olmalı")
    void testCors_AllowedOrigins_ShouldWork() throws Exception {
        // OPTIONS request from allowed origin
        mockMvc.perform(options("/api/problems")
                .header("Origin", "http://localhost:63342")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("CORS: Allowed methods - POST, PUT, DELETE desteklenmeli")
    void testCors_AllowedMethods_ShouldIncludeAll() throws Exception {
        // POST method
        mockMvc.perform(options("/api/problems")
                .header("Origin", "http://localhost:8080")
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk());

        // PUT method
        mockMvc.perform(options("/api/problems")
                .header("Origin", "http://localhost:8080")
                .header("Access-Control-Request-Method", "PUT"))
                .andExpect(status().isOk());

        // DELETE method
        mockMvc.perform(options("/api/problems")
                .header("Origin", "http://localhost:8080")
                .header("Access-Control-Request-Method", "DELETE"))
                .andExpect(status().isOk());
    }

    // ==================== EDGE CASE TESTS ====================

    @Test
    @DisplayName("Edge Case: Var olmayan endpoint - 404 Not Found (401 değil)")
    void testEdgeCase_NonExistentEndpoint_ShouldReturn404Not401() throws Exception {
        // Non-existent public endpoint
        mockMvc.perform(get("/api/nonexistent"))
                .andExpect(status().isNotFound()); // 404, not 401
    }

    @Test
    @DisplayName("Edge Case: Yanlış HTTP metodu - 405 Method Not Allowed")
    void testEdgeCase_WrongHttpMethod_ShouldReturn405() throws Exception {
        // Wrong method (POST instead of GET) for public endpoint
        mockMvc.perform(post("/api/problems"))
                .andExpect(status().isMethodNotAllowed()); // 405, not 401
    }

    @Test
    @DisplayName("Edge Case: SQL Injection attempt - güvenli olmalı")
    void testEdgeCase_SqlInjection_ShouldBeSafe() throws Exception {
        // SQL injection attempt in path variable
        String maliciousId = "1' OR '1'='1";

        mockMvc.perform(get("/api/problems/{id}", maliciousId))
                .andExpect(status().is4xxClientError()); // Should fail safely (400 or 404)
    }

    @Test
    @DisplayName("Edge Case: XSS attempt in query params - güvenli olmalı")
    void testEdgeCase_XssAttempt_ShouldBeSafe() throws Exception {
        // XSS attempt in query parameter
        String xssPayload = "<script>alert('XSS')</script>";

        mockMvc.perform(get("/api/problems")
                .param("search", xssPayload))
                .andExpect(status().isOk()); // Should handle safely, not crash
    }
}
