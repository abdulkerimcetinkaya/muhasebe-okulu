package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.CardSectionDTO;
import com.example.muhasebeokulu5.dto.StudyCardDTO;
import com.example.muhasebeokulu5.dto.StudyCardDetailDTO;
import com.example.muhasebeokulu5.service.StudyCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Student-facing endpoints for StudyCard module
 */
@RestController
@RequestMapping("/api/study-cards")
@RequiredArgsConstructor
@Tag(name = "Study Cards", description = "Student learning cards API")
public class StudyCardController {

    private final StudyCardService studyCardService;

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
}
