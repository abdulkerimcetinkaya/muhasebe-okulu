package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.QuizDTO;
import com.example.muhasebeokulu5.service.QuizService;
import com.example.muhasebeokulu5.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import org.springframework.context.annotation.Import;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.example.muhasebeokulu5.config.TestConfiguration;

@WebMvcTest(StudentQuizController.class)
@Import(TestConfiguration.class)
@DisplayName("StudentQuizController Tests - Privilege Escalation Prevention")
class StudentQuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuizService quizService;

    @MockBean
    private UserService userService;

    private UUID authenticatedUserId;
    private UUID otherUserId;
    private List<QuizDTO> mockQuizzes;

    @BeforeEach
    void setUp() {
        authenticatedUserId = UUID.randomUUID();
        otherUserId = UUID.randomUUID();

        // Mock quiz data
        QuizDTO quiz1 = new QuizDTO();
        quiz1.setId(1L);
        quiz1.setTitle("Test Quiz 1");

        QuizDTO quiz2 = new QuizDTO();
        quiz2.setId(2L);
        quiz2.setTitle("Test Quiz 2");

        mockQuizzes = Arrays.asList(quiz1, quiz2);
    }

    // ==================== PRIVILEGE ESCALATION PREVENTION TESTS ====================

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Privilege Escalation: Kendi verilerine erişim - 200 OK dönmeli")
    void testGetCompletedQuizzes_OwnUserId_ShouldReturn200() throws Exception {
        // Given: Authenticated user accessing their own data
        when(userService.getUserIdByUsername("testuser")).thenReturn(authenticatedUserId);
        when(quizService.getCompletedQuizzes(authenticatedUserId)).thenReturn(mockQuizzes);

        // When & Then
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", authenticatedUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("Test Quiz 1"));

        // Verify service was called
        verify(quizService).getCompletedQuizzes(authenticatedUserId);
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Privilege Escalation: Başka kullanıcının verilerine erişim - 403 Forbidden dönmeli")
    void testGetCompletedQuizzes_OtherUserId_ShouldReturn403() throws Exception {
        // Given: Authenticated user trying to access another user's data
        when(userService.getUserIdByUsername("testuser")).thenReturn(authenticatedUserId);

        // When & Then
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", otherUserId))
                .andExpect(status().isForbidden());

        // Verify service was NOT called (blocked at controller level)
        verify(quizService, never()).getCompletedQuizzes(any());
    }

    @Test
    @DisplayName("Privilege Escalation: Kimlik doğrulama olmadan erişim - 401 Unauthorized dönmeli")
    void testGetCompletedQuizzes_NotAuthenticated_ShouldReturn401() throws Exception {
        // When & Then: No authentication
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", authenticatedUserId))
                .andExpect(status().isUnauthorized());

        // Verify service was NOT called
        verify(quizService, never()).getCompletedQuizzes(any());
    }

    @Test
    @WithMockUser(username = "attacker")
    @DisplayName("Privilege Escalation: Geçersiz UUID formatı - 400 veya 403 dönmeli")
    void testGetCompletedQuizzes_InvalidUuidFormat_ShouldReturnError() throws Exception {
        // Given: Invalid UUID format
        String invalidUuid = "not-a-valid-uuid";

        // When & Then
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", invalidUuid))
                .andExpect(status().is4xxClientError());

        // Verify service was NOT called
        verify(quizService, never()).getCompletedQuizzes(any());
    }

    // ==================== SECURITY BOUNDARY TESTS ====================

    @Test
    @WithMockUser(username = "user1")
    @DisplayName("Security: Farklı kullanıcılar aynı anda kendi verilerine erişebilmeli")
    void testGetCompletedQuizzes_MultipleUsers_ShouldIsolateData() throws Exception {
        // Given: Two different users
        UUID user1Id = UUID.randomUUID();
        UUID user2Id = UUID.randomUUID();

        QuizDTO user1Quiz = new QuizDTO();
        user1Quiz.setId(10L);
        user1Quiz.setTitle("User1 Quiz");

        when(userService.getUserIdByUsername("user1")).thenReturn(user1Id);
        when(quizService.getCompletedQuizzes(user1Id)).thenReturn(Arrays.asList(user1Quiz));

        // When & Then: User1 accesses their data
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", user1Id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10));

        // Verify only user1's data was accessed
        verify(quizService).getCompletedQuizzes(user1Id);
        verify(quizService, never()).getCompletedQuizzes(user2Id);
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"ADMIN"})
    @DisplayName("Security: Admin rolü bile başka kullanıcı verisine erişememeli (Authorization !== Authentication)")
    void testGetCompletedQuizzes_AdminRole_ShouldStillEnforceOwnership() throws Exception {
        // Given: Admin user trying to access another user's data
        // IMPORTANT: Admin role does NOT bypass userId validation
        when(userService.getUserIdByUsername("testuser")).thenReturn(authenticatedUserId);

        // When & Then: Admin trying to access other user's data still gets 403
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", otherUserId))
                .andExpect(status().isForbidden());

        // Verify service was NOT called
        verify(quizService, never()).getCompletedQuizzes(any());
    }

    // ==================== EDGE CASE TESTS ====================

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Edge Case: Kullanıcı hiç quiz çözmemiş - boş liste dönmeli")
    void testGetCompletedQuizzes_NoCompletedQuizzes_ShouldReturnEmptyList() throws Exception {
        // Given: User has no completed quizzes
        when(userService.getUserIdByUsername("testuser")).thenReturn(authenticatedUserId);
        when(quizService.getCompletedQuizzes(authenticatedUserId)).thenReturn(Arrays.asList());

        // When & Then
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", authenticatedUserId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(quizService).getCompletedQuizzes(authenticatedUserId);
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Edge Case: Service exception - 500 Internal Server Error dönmeli")
    void testGetCompletedQuizzes_ServiceException_ShouldReturn500() throws Exception {
        // Given: Service throws exception
        when(userService.getUserIdByUsername("testuser")).thenReturn(authenticatedUserId);
        when(quizService.getCompletedQuizzes(authenticatedUserId))
                .thenThrow(new RuntimeException("Database connection error"));

        // When & Then
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", authenticatedUserId))
                .andExpect(status().isInternalServerError());
    }

    // ==================== AUTHENTICATION INTEGRATION TESTS ====================

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Authentication: Username'den userId'ye doğru dönüşüm yapılmalı")
    void testGetCompletedQuizzes_UsernameToUserIdMapping_ShouldBeCorrect() throws Exception {
        // Given
        when(userService.getUserIdByUsername("testuser")).thenReturn(authenticatedUserId);
        when(quizService.getCompletedQuizzes(authenticatedUserId)).thenReturn(mockQuizzes);

        // When
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", authenticatedUserId))
                .andExpect(status().isOk());

        // Then: Verify correct username was used for lookup
        verify(userService).getUserIdByUsername("testuser");
    }

    @Test
    @WithMockUser(username = "nonexistent")
    @DisplayName("Authentication: Var olmayan kullanıcı - exception fırlatmalı")
    void testGetCompletedQuizzes_NonExistentUser_ShouldThrowException() throws Exception {
        // Given: UserService throws exception for non-existent user
        when(userService.getUserIdByUsername("nonexistent"))
                .thenThrow(new RuntimeException("User not found"));

        // When & Then
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", UUID.randomUUID()))
                .andExpect(status().isInternalServerError());
    }

    // ==================== DEFENSIVE PROGRAMMING TESTS ====================

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Defense: UUID case-insensitive karşılaştırma (paranoid check)")
    void testGetCompletedQuizzes_UuidCaseInsensitivity_ShouldWork() throws Exception {
        // Given: UUID in different case formats
        UUID testUuid = UUID.fromString("550e8400-e29b-41d4-a716-446655440000");
        String upperCaseUuid = testUuid.toString().toUpperCase();

        when(userService.getUserIdByUsername("testuser")).thenReturn(testUuid);
        when(quizService.getCompletedQuizzes(testUuid)).thenReturn(mockQuizzes);

        // When & Then: Both formats should work (UUID parsing is case-insensitive)
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", upperCaseUuid))
                .andExpect(status().isOk());

        verify(quizService).getCompletedQuizzes(testUuid);
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Defense: Path traversal attempt - UUID validation korumalı")
    void testGetCompletedQuizzes_PathTraversalAttempt_ShouldFail() throws Exception {
        // Given: Malicious path traversal attempt
        String maliciousPath = "../../../admin";

        // When & Then: Should fail with 400 Bad Request (invalid UUID)
        mockMvc.perform(get("/api/quizzes/users/{userId}/completed", maliciousPath))
                .andExpect(status().is4xxClientError());

        // Verify service was NOT called
        verify(quizService, never()).getCompletedQuizzes(any());
    }
}
