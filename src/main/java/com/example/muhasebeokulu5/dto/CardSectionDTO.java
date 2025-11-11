package com.example.muhasebeokulu5.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for CardSection with mixed content support
 * Now contains a list of ContentItems instead of single content type
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardSectionDTO {
    private Long id;
    private Long studyCardId; // Required when creating/updating
    private String title;
    private Integer displayOrder;
    private Boolean active; // Maps to isActive

    /**
     * Rich text content with slash command support (HTML format)
     */
    private String content;

    /**
     * List of content items in this section (DEPRECATED - use content field instead)
     * Can contain mixed types: text, problems, quizzes in any order
     */
    private List<ContentItemDTO> contentItems = new ArrayList<>();
}
