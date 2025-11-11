package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.BulkSectionImportDTO;
import com.example.muhasebeokulu5.dto.BulkStudyCardImportDTO;
import com.example.muhasebeokulu5.dto.CardSectionDTO;
import com.example.muhasebeokulu5.dto.StudyCardDTO;
import com.example.muhasebeokulu5.entities.CardSection;
import com.example.muhasebeokulu5.entities.StudyCard;
import com.example.muhasebeokulu5.service.StudyCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin endpoints for managing StudyCards and CardSections
 */
@RestController
@RequestMapping("/api/admin/study-cards")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Study Cards", description = "Admin management API for study cards")
public class AdminStudyCardController {

    private final StudyCardService studyCardService;

    // ==================== STUDY CARD CRUD ====================

    @GetMapping
    @Operation(summary = "Get all study cards", description = "Get all study cards for admin management")
    public ResponseEntity<List<StudyCardDTO>> getAllStudyCards() {
        List<StudyCardDTO> cards = studyCardService.getAllStudyCards();
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get study card by ID", description = "Get a single study card by ID for editing")
    public ResponseEntity<StudyCard> getStudyCardById(@PathVariable Long id) {
        // Using the repository directly since we need the full entity for admin editing
        StudyCard card = studyCardService.getStudyCardById(id);
        return ResponseEntity.ok(card);
    }

    @PostMapping
    @Operation(summary = "Create study card", description = "Create a new study card")
    public ResponseEntity<StudyCard> createStudyCard(@RequestBody StudyCard studyCard) {
        StudyCard created = studyCardService.createStudyCard(studyCard);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update study card", description = "Update an existing study card")
    public ResponseEntity<StudyCard> updateStudyCard(@PathVariable Long id, @RequestBody StudyCard studyCard) {
        StudyCard updated = studyCardService.updateStudyCard(id, studyCard);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete study card", description = "Soft delete a study card")
    public ResponseEntity<Void> deleteStudyCard(@PathVariable Long id) {
        studyCardService.deleteStudyCard(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk")
    @Operation(summary = "Bulk import study cards", description = "Import multiple study cards with sections from JSON")
    public ResponseEntity<BulkStudyCardImportDTO.ImportResult> bulkImportStudyCards(
            @RequestBody @Valid BulkStudyCardImportDTO importDTO) {
        BulkStudyCardImportDTO.ImportResult result = studyCardService.bulkImportStudyCards(importDTO);
        return ResponseEntity.ok(result);
    }

    // ==================== CARD SECTION CRUD ====================

    @GetMapping("/{cardId}/sections")
    @Operation(summary = "Get card sections", description = "Get all sections for a specific study card")
    public ResponseEntity<List<CardSectionDTO>> getCardSections(@PathVariable Long cardId) {
        List<CardSectionDTO> sections = studyCardService.getCardSections(cardId);
        return ResponseEntity.ok(sections);
    }

    @GetMapping("/sections/{id}")
    @Operation(summary = "Get card section by ID", description = "Get a single card section by ID for editing")
    public ResponseEntity<CardSectionDTO> getCardSectionById(@PathVariable Long id) {
        CardSectionDTO section = studyCardService.getCardSectionWithContentItems(id);
        return ResponseEntity.ok(section);
    }

    @PostMapping("/sections")
    @Operation(summary = "Create card section", description = "Create a new section within a study card")
    public ResponseEntity<CardSection> createCardSection(@RequestBody CardSectionDTO sectionDTO) {
        CardSection created = studyCardService.createCardSection(sectionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/sections/{id}")
    @Operation(summary = "Update card section", description = "Update an existing card section")
    public ResponseEntity<CardSection> updateCardSection(@PathVariable Long id, @RequestBody CardSectionDTO sectionDTO) {
        try {
            System.out.println("=== UPDATE SECTION DEBUG ===");
            System.out.println("Section ID: " + id);
            System.out.println("Title: " + sectionDTO.getTitle());
            System.out.println("ContentItems count: " + (sectionDTO.getContentItems() != null ? sectionDTO.getContentItems().size() : 0));

            if (sectionDTO.getContentItems() != null) {
                for (int i = 0; i < sectionDTO.getContentItems().size(); i++) {
                    var item = sectionDTO.getContentItems().get(i);
                    System.out.println("  Item " + i + ": type=" + item.getContentType() + ", blockData=" + (item.getBlockData() != null ? "present" : "null"));
                }
            }

            CardSection updated = studyCardService.updateCardSection(id, sectionDTO);

            System.out.println("=== UPDATE SUCCESS ===");
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.err.println("=== UPDATE ERROR ===");
            System.err.println("Error message: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getName());
            e.printStackTrace();
            throw new RuntimeException("Update failed: " + e.getMessage(), e);
        }
    }

    @DeleteMapping("/sections/{id}")
    @Operation(summary = "Delete card section", description = "Soft delete a card section")
    public ResponseEntity<Void> deleteCardSection(@PathVariable Long id) {
        studyCardService.deleteCardSection(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sections/bulk")
    @Operation(summary = "Bulk import sections", description = "Import multiple sections with content items into an existing study card")
    public ResponseEntity<BulkSectionImportDTO.ImportResult> bulkImportSections(
            @RequestBody @Valid BulkSectionImportDTO importDTO) {
        BulkSectionImportDTO.ImportResult result = studyCardService.bulkImportSections(importDTO);
        return ResponseEntity.ok(result);
    }
}
