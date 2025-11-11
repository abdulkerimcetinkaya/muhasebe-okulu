package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.CardSectionDTO;
import com.example.muhasebeokulu5.dto.StudyCardDTO;
import com.example.muhasebeokulu5.dto.StudyCardDetailDTO;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.entities.UserCardProgress;
import com.example.muhasebeokulu5.service.StudyCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Student-facing endpoints for StudyCard module
 */
@RestController
@RequestMapping("/api/study-cards")
@RequiredArgsConstructor
@Tag(name = "Study Cards", description = "Student learning cards API")
public class StudyCardController {

    private final StudyCardService studyCardService;
    private final com.example.muhasebeokulu5.repository.UserRepository userRepository;

    /**
     * Helper method to extract User entity from Authentication
     */
    private User getUserFromAuthentication(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        
        String username;
        if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            username = ((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal()).getUsername();
        } else if (authentication.getPrincipal() instanceof String) {
            username = (String) authentication.getPrincipal();
        } else {
            return null;
        }
        
        return userRepository.findByUsername(username).orElse(null);
    }

    /**
     * Get all active study cards (for study.html listing)
     */
    @GetMapping
    @Operation(summary = "Get all study cards", description = "Retrieve all active study cards for listing")
    public ResponseEntity<List<StudyCardDTO>> getAllStudyCards() {
        List<StudyCardDTO> cards = studyCardService.getAllStudyCards();
        return ResponseEntity.ok(cards);
    }

    /**
     * Get study card detail with sections (for study-detail.html)
     */
    @GetMapping("/{cardId}")
    @Operation(summary = "Get study card detail", description = "Retrieve study card with all sections")
    public ResponseEntity<StudyCardDetailDTO> getStudyCardDetail(@PathVariable Long cardId) {
        StudyCardDetailDTO detail = studyCardService.getStudyCardDetail(cardId);
        return ResponseEntity.ok(detail);
    }

    /**
     * Get sections for a study card
     */
    @GetMapping("/{cardId}/sections")
    @Operation(summary = "Get card sections", description = "Retrieve all sections for a study card")
    public ResponseEntity<List<CardSectionDTO>> getCardSections(@PathVariable Long cardId) {
        List<CardSectionDTO> sections = studyCardService.getCardSections(cardId);
        return ResponseEntity.ok(sections);
    }

    /**
     * Get specific section content
     */
    @GetMapping("/sections/{sectionId}")
    @Operation(summary = "Get section content", description = "Retrieve specific section with content and related entities")
    public ResponseEntity<CardSectionDTO> getCardSection(@PathVariable Long sectionId) {
        CardSectionDTO section = studyCardService.getCardSection(sectionId);
        return ResponseEntity.ok(section);
    }

    // ===========================
    // USER PROGRESS ENDPOINTS
    // ===========================

    /**
     * Mark a section as started (viewed)
     */
    @PostMapping("/sections/{sectionId}/start")
    @Operation(summary = "Mark section started", description = "Mark a section as started (viewed) for the authenticated user")
    public ResponseEntity<UserCardProgress> markSectionStarted(
            @PathVariable Long sectionId,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        UserCardProgress progress = studyCardService.markSectionStarted(user.getId(), sectionId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Mark a section as completed
     */
    @PostMapping("/sections/{sectionId}/complete")
    @Operation(summary = "Mark section completed", description = "Mark a section as completed for the authenticated user")
    public ResponseEntity<UserCardProgress> markSectionCompleted(
            @PathVariable Long sectionId,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        UserCardProgress progress = studyCardService.markSectionCompleted(user.getId(), sectionId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Get user progress for a specific study card
     */
    @GetMapping("/{cardId}/progress")
    @Operation(summary = "Get card progress", description = "Get user progress for a specific study card")
    public ResponseEntity<Map<String, Object>> getUserCardProgress(
            @PathVariable Long cardId,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Map<String, Object> progress = studyCardService.getUserCardProgress(user.getId(), cardId);
        return ResponseEntity.ok(progress);
    }

    /**
     * Get all user progress across all cards
     */
    @GetMapping("/progress")
    @Operation(summary = "Get all progress", description = "Get user progress across all study cards")
    public ResponseEntity<List<Map<String, Object>>> getAllUserProgress(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        List<Map<String, Object>> progress = studyCardService.getAllUserProgress(user.getId());
        return ResponseEntity.ok(progress);
    }

    /**
     * Reset progress for a section
     */
    @DeleteMapping("/sections/{sectionId}/progress")
    @Operation(summary = "Reset section progress", description = "Reset user progress for a specific section")
    public ResponseEntity<Void> resetSectionProgress(
            @PathVariable Long sectionId,
            Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        studyCardService.resetSectionProgress(user.getId(), sectionId);
        return ResponseEntity.noContent().build();
    }
}
