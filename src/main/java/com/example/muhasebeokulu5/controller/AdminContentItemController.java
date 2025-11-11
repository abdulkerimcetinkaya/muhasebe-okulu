package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.dto.ContentItemDTO;
import com.example.muhasebeokulu5.service.ContentItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin controller for managing ContentItems within CardSections
 * Enables mixed content management (text, problems, quizzes) with ordering support
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/admin/content-items")
@RequiredArgsConstructor
public class AdminContentItemController {

    private final ContentItemService contentItemService;

    /**
     * Get all content items for a specific card section
     */
    @GetMapping("/section/{cardSectionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContentItemDTO>> getContentItems(@PathVariable Long cardSectionId) {
        List<ContentItemDTO> items = contentItemService.getContentItems(cardSectionId);
        return ResponseEntity.ok(items);
    }

    /**
     * Get a single content item by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContentItemDTO> getContentItem(@PathVariable Long id) {
        ContentItemDTO item = contentItemService.getContentItem(id);
        return ResponseEntity.ok(item);
    }

    /**
     * Create a new content item
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContentItemDTO> createContentItem(@RequestBody ContentItemDTO dto) {
        ContentItemDTO created = contentItemService.createContentItem(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * Update an existing content item
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContentItemDTO> updateContentItem(
            @PathVariable Long id,
            @RequestBody ContentItemDTO dto) {
        ContentItemDTO updated = contentItemService.updateContentItem(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete (soft delete) a content item
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContentItem(@PathVariable Long id) {
        contentItemService.deleteContentItem(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Reorder content items within a section
     * Accepts ordered list of content item IDs
     */
    @PutMapping("/section/{cardSectionId}/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reorderContentItems(
            @PathVariable Long cardSectionId,
            @RequestBody List<Long> orderedIds) {
        contentItemService.reorderContentItems(cardSectionId, orderedIds);
        return ResponseEntity.noContent().build();
    }
}
