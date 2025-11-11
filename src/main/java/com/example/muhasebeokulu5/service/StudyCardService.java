package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.*;
import com.example.muhasebeokulu5.entities.*;
import com.example.muhasebeokulu5.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyCardService {

    private final StudyCardRepository studyCardRepository;
    private final CardSectionRepository cardSectionRepository;
    private final ContentItemService contentItemService;
    private final ModelMapper modelMapper;
    private final UserCardProgressRepository progressRepository;
    private final UserRepository userRepository;

    /**
     * Get all active study cards for listing on study.html
     */
    public List<StudyCardDTO> getAllStudyCards() {
        List<StudyCard> cards = studyCardRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        return cards.stream()
            .map(card -> {
                StudyCardDTO dto = modelMapper.map(card, StudyCardDTO.class);
                dto.setSectionCount(card.getSections().size());
                return dto;
            })
            .collect(Collectors.toList());
    }

    /**
     * Get study card with all sections for detail page
     */
    public StudyCardDetailDTO getStudyCardDetail(Long cardId) {
        StudyCard card = studyCardRepository.findByIdWithSections(cardId);
        if (card == null) {
            throw new RuntimeException("Study card not found: " + cardId);
        }

        StudyCardDetailDTO dto = modelMapper.map(card, StudyCardDetailDTO.class);

        // Map sections with related entity details
        List<CardSectionDTO> sectionDTOs = card.getSections().stream()
            .filter(CardSection::getIsActive)
            .map(this::mapCardSectionWithRelatedEntities)
            .collect(Collectors.toList());

        dto.setSections(sectionDTOs);
        return dto;
    }

    /**
     * Get sections for a specific study card
     */
    public List<CardSectionDTO> getCardSections(Long cardId) {
        List<CardSection> sections = cardSectionRepository
            .findByStudyCardIdAndIsActiveTrueOrderByDisplayOrderAsc(cardId);

        return sections.stream()
            .map(this::mapCardSectionWithRelatedEntities)
            .collect(Collectors.toList());
    }

    /**
     * Get a specific section with content
     */
    public CardSectionDTO getCardSection(Long sectionId) {
        CardSection section = cardSectionRepository.findByIdAndIsActiveTrue(sectionId);
        if (section == null) {
            throw new RuntimeException("Card section not found: " + sectionId);
        }

        return mapCardSectionWithRelatedEntities(section);
    }

    /**
     * Map CardSection to DTO with content items
     * NOTE: ContentItems are now managed separately through ContentItemService
     * NEW: Also includes direct HTML content field from rich text editor
     */
    private CardSectionDTO mapCardSectionWithRelatedEntities(CardSection section) {
        CardSectionDTO dto = modelMapper.map(section, CardSectionDTO.class);

        // NEW: Explicitly set content field (should be auto-mapped but ensure it's there)
        dto.setContent(section.getContent());

        // Load content items for this section (backward compatibility)
        List<ContentItemDTO> contentItems = contentItemService.getContentItems(section.getId());
        dto.setContentItems(contentItems);

        return dto;
    }

    /**
     * Admin methods for CRUD operations
     */

    public StudyCard getStudyCardById(Long id) {
        return studyCardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Study card not found: " + id));
    }

    public CardSection getCardSectionById(Long id) {
        return cardSectionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Card section not found: " + id));
    }

    public CardSectionDTO getCardSectionWithContentItems(Long id) {
        CardSection section = cardSectionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Card section not found: " + id));
        return mapCardSectionWithRelatedEntities(section);
    }

    @Transactional
    public StudyCard createStudyCard(StudyCard studyCard) {
        return studyCardRepository.save(studyCard);
    }

    @Transactional
    public StudyCard updateStudyCard(Long id, StudyCard updatedCard) {
        StudyCard existing = studyCardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Study card not found: " + id));

        existing.setTitle(updatedCard.getTitle());
        existing.setDescription(updatedCard.getDescription());
        existing.setIcon(updatedCard.getIcon());
        existing.setColor(updatedCard.getColor());
        existing.setDisplayOrder(updatedCard.getDisplayOrder());
        existing.setIsActive(updatedCard.getIsActive());

        return studyCardRepository.save(existing);
    }

    @Transactional
    public void deleteStudyCard(Long id) {
        StudyCard card = studyCardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Study card not found: " + id));
        card.setIsActive(false);
        studyCardRepository.save(card);
    }

    @Transactional
    public CardSection createCardSection(CardSectionDTO dto) {
        // Validate studyCardId
        if (dto.getStudyCardId() == null) {
            throw new RuntimeException("Study card ID is required");
        }

        // Fetch the StudyCard
        StudyCard studyCard = studyCardRepository.findById(dto.getStudyCardId())
            .orElseThrow(() -> new RuntimeException("Study card not found: " + dto.getStudyCardId()));

        // Create new CardSection entity (simplified - no content management)
        CardSection section = new CardSection();
        section.setStudyCard(studyCard);
        section.setTitle(dto.getTitle());
        section.setContent(dto.getContent()); // NEW: Set HTML content from rich text editor
        section.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        section.setIsActive(dto.getActive() != null ? dto.getActive() : true);

        // Save the section
        section = cardSectionRepository.save(section);

        // Create content items if provided
        if (dto.getContentItems() != null && !dto.getContentItems().isEmpty()) {
            for (ContentItemDTO contentItemDTO : dto.getContentItems()) {
                contentItemDTO.setCardSectionId(section.getId());
                contentItemService.createContentItem(contentItemDTO);
            }
        }

        return section;
    }

    @Transactional
    public CardSection updateCardSection(Long id, CardSectionDTO dto) {
        CardSection existing = cardSectionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Card section not found: " + id));

        // Update studyCard if provided
        if (dto.getStudyCardId() != null && !dto.getStudyCardId().equals(existing.getStudyCard().getId())) {
            StudyCard studyCard = studyCardRepository.findById(dto.getStudyCardId())
                .orElseThrow(() -> new RuntimeException("Study card not found: " + dto.getStudyCardId()));
            existing.setStudyCard(studyCard);
        }

        // Update basic section properties
        existing.setTitle(dto.getTitle());
        existing.setContent(dto.getContent()); // NEW: Update HTML content from rich text editor
        existing.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : existing.getDisplayOrder());
        existing.setIsActive(dto.getActive() != null ? dto.getActive() : existing.getIsActive());

        // Clear existing content items (orphanRemoval will delete them)
        existing.getContentItems().clear();

        // Save to trigger orphan removal
        existing = cardSectionRepository.save(existing);

        // Create new content items if provided
        if (dto.getContentItems() != null && !dto.getContentItems().isEmpty()) {
            for (ContentItemDTO contentItemDTO : dto.getContentItems()) {
                contentItemDTO.setCardSectionId(existing.getId());
                contentItemService.createContentItem(contentItemDTO);
            }
        }

        return existing;
    }

    @Transactional
    public void deleteCardSection(Long id) {
        CardSection section = cardSectionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Card section not found: " + id));
        section.setIsActive(false);
        cardSectionRepository.save(section);
    }

    /**
     * Bulk import study cards with sections from JSON
     */
    @Transactional
    public BulkStudyCardImportDTO.ImportResult bulkImportStudyCards(BulkStudyCardImportDTO importDTO) {
        List<BulkStudyCardImportDTO.ImportError> errors = new ArrayList<>();
        int totalCards = importDTO.getCards().size();
        int successCount = 0;
        int totalSections = 0;
        int successSectionCount = 0;

        for (int i = 0; i < importDTO.getCards().size(); i++) {
            BulkStudyCardImportDTO.CardImportItem cardItem = importDTO.getCards().get(i);

            try {
                // Create StudyCard entity
                StudyCard studyCard = new StudyCard();
                studyCard.setTitle(cardItem.getTitle());
                studyCard.setDescription(cardItem.getDescription());
                studyCard.setIcon(cardItem.getImageUrl()); // Using imageUrl as icon
                studyCard.setColor("#4F46E5"); // Default color
                studyCard.setIsActive(cardItem.getIsActive() != null ? cardItem.getIsActive() : true);

                // Get max displayOrder and increment
                Integer maxOrder = studyCardRepository.findAll().stream()
                        .map(StudyCard::getDisplayOrder)
                        .filter(order -> order != null)
                        .max(Integer::compareTo)
                        .orElse(0);
                studyCard.setDisplayOrder(maxOrder + 1);

                // Save the card
                studyCard = studyCardRepository.save(studyCard);
                successCount++;

                // Process sections if present
                if (cardItem.getSections() != null && !cardItem.getSections().isEmpty()) {
                    totalSections += cardItem.getSections().size();

                    for (int j = 0; j < cardItem.getSections().size(); j++) {
                        BulkStudyCardImportDTO.SectionImportItem sectionItem = cardItem.getSections().get(j);

                        try {
                            // Create CardSection (container only)
                            CardSection section = new CardSection();
                            section.setStudyCard(studyCard);
                            section.setTitle(sectionItem.getTitle());
                            section.setDisplayOrder(j + 1);
                            section.setIsActive(sectionItem.getIsActive() != null ? sectionItem.getIsActive() : true);

                            section = cardSectionRepository.save(section);

                            // Create ContentItem for the section content
                            ContentItemDTO contentItemDTO = new ContentItemDTO();
                            contentItemDTO.setCardSectionId(section.getId());
                            contentItemDTO.setDisplayOrder(0); // First item in section
                            contentItemDTO.setActive(true);

                            // Validate and set content type
                            ContentItem.ContentType contentType;
                            try {
                                contentType = ContentItem.ContentType.valueOf(sectionItem.getContentType().toUpperCase());
                            } catch (IllegalArgumentException e) {
                                throw new RuntimeException("Geçersiz içerik tipi: " + sectionItem.getContentType());
                            }
                            contentItemDTO.setContentType(contentType.name());

                            // Set content based on type
                            if (contentType == ContentItem.ContentType.TEXT) {
                                if (sectionItem.getContent() == null || sectionItem.getContent().trim().isEmpty()) {
                                    throw new RuntimeException("TEXT tipi için HTML içerik boş olamaz");
                                }
                                contentItemDTO.setTextContent(sectionItem.getContent());
                            } else {
                                // For PROBLEM, QUIZ types, you might want to set relatedProblemId/relatedQuizId
                                // For now, just store as TEXT with warning
                                contentItemDTO.setTextContent(sectionItem.getContent() != null ? sectionItem.getContent() : "");
                            }

                            contentItemService.createContentItem(contentItemDTO);
                            successSectionCount++;

                        } catch (Exception e) {
                            errors.add(new BulkStudyCardImportDTO.ImportError(
                                    i,
                                    cardItem.getTitle() + " - Bölüm " + (j + 1),
                                    "Bölüm eklenemedi: " + e.getMessage()
                            ));
                        }
                    }
                }

            } catch (Exception e) {
                errors.add(new BulkStudyCardImportDTO.ImportError(
                        i,
                        cardItem.getTitle(),
                        e.getMessage()
                ));
            }
        }

        int failureCount = totalCards - successCount;

        return new BulkStudyCardImportDTO.ImportResult(
                totalCards,
                successCount,
                failureCount,
                totalSections,
                successSectionCount,
                errors
        );
    }

    /**
     * Bulk import sections into an existing study card
     */
    @Transactional
    public BulkSectionImportDTO.ImportResult bulkImportSections(BulkSectionImportDTO importDTO) {
        List<BulkSectionImportDTO.ImportError> errors = new ArrayList<>();
        int totalSections = importDTO.getSections().size();
        int successCount = 0;

        // Validate that the study card exists
        StudyCard studyCard = studyCardRepository.findById(importDTO.getStudyCardId())
                .orElseThrow(() -> new RuntimeException("Study card not found: " + importDTO.getStudyCardId()));

        for (int i = 0; i < importDTO.getSections().size(); i++) {
            CardSectionDTO sectionDTO = importDTO.getSections().get(i);

            try {
                // Ensure the studyCardId is set
                sectionDTO.setStudyCardId(importDTO.getStudyCardId());

                // Create the section with all its content items
                createCardSection(sectionDTO);
                successCount++;

            } catch (Exception e) {
                errors.add(new BulkSectionImportDTO.ImportError(
                        i,
                        sectionDTO.getTitle(),
                        e.getMessage()
                ));
            }
        }

        int failureCount = totalSections - successCount;

        return new BulkSectionImportDTO.ImportResult(
                importDTO.getStudyCardId(),
                totalSections,
                successCount,
                failureCount,
                errors
        );
    }

    // ===========================
    // USER PROGRESS TRACKING
    // ===========================

    /**
     * Mark a section as started (viewed) for a user
     */
    @Transactional
    public UserCardProgress markSectionStarted(java.util.UUID userId, Long sectionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CardSection section = cardSectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        StudyCard card = section.getStudyCard();

        // Check if already exists
        java.util.Optional<UserCardProgress> existing = progressRepository
                .findByUserIdAndCardSectionId(userId, sectionId);

        if (existing.isPresent()) {
            return existing.get();
        }

        // Create new progress record (started but not completed)
        UserCardProgress progress = new UserCardProgress();
        progress.setUser(user);
        progress.setStudyCard(card);
        progress.setCardSection(section);
        progress.setCompleted(false);
        progress.setStartedAt(java.time.LocalDateTime.now());

        return progressRepository.save(progress);
    }

    /**
     * Mark a section as completed for a user
     */
    @Transactional
    public UserCardProgress markSectionCompleted(java.util.UUID userId, Long sectionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CardSection section = cardSectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));

        StudyCard card = section.getStudyCard();

        // Check if already exists
        java.util.Optional<UserCardProgress> existing = progressRepository
                .findByUserIdAndCardSectionId(userId, sectionId);

        UserCardProgress progress;
        if (existing.isPresent()) {
            // Update existing record
            progress = existing.get();
            if (!progress.getCompleted()) {
                progress.setCompleted(true);
                progress.setCompletedAt(java.time.LocalDateTime.now());
                progress = progressRepository.save(progress);
            }
        } else {
            // Create new progress record (started and completed)
            progress = new UserCardProgress();
            progress.setUser(user);
            progress.setStudyCard(card);
            progress.setCardSection(section);
            progress.setCompleted(true);
            progress.setStartedAt(java.time.LocalDateTime.now());
            progress.setCompletedAt(java.time.LocalDateTime.now());
            progress = progressRepository.save(progress);
        }

        return progress;
    }

    /**
     * Get user progress for a specific study card
     */
    public java.util.Map<String, Object> getUserCardProgress(java.util.UUID userId, Long cardId) {
        java.util.List<UserCardProgress> allProgress = progressRepository
                .findByUserIdAndStudyCardId(userId, cardId);

        StudyCard card = studyCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Study card not found"));

        int totalSections = card.getSections().size();

        // Separate started and completed sections
        java.util.List<Long> startedSectionIds = allProgress.stream()
                .filter(p -> !p.getCompleted())
                .map(p -> p.getCardSection().getId())
                .collect(java.util.stream.Collectors.toList());

        java.util.List<Long> completedSectionIds = allProgress.stream()
                .filter(p -> p.getCompleted())
                .map(p -> p.getCardSection().getId())
                .collect(java.util.stream.Collectors.toList());

        int completedCount = completedSectionIds.size();
        int startedCount = startedSectionIds.size();

        // Determine card status
        String status;
        if (completedCount == 0 && startedCount == 0) {
            status = "not-started";
        } else if (completedCount == totalSections) {
            status = "completed";
        } else {
            status = "in-progress";
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalSections", totalSections);
        result.put("completedSections", completedCount);
        result.put("startedSections", startedCount);
        result.put("completedSectionIds", completedSectionIds);
        result.put("startedSectionIds", startedSectionIds);
        result.put("percentage", totalSections > 0 ? (completedCount * 100 / totalSections) : 0);
        result.put("status", status);

        return result;
    }

    /**
     * Get all user progress across all study cards
     */
    public java.util.List<java.util.Map<String, Object>> getAllUserProgress(java.util.UUID userId) {
        java.util.List<StudyCard> allCards = studyCardRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        java.util.List<java.util.Map<String, Object>> progressList = new ArrayList<>();

        for (StudyCard card : allCards) {
            java.util.Map<String, Object> cardProgress = getUserCardProgress(userId, card.getId());
            cardProgress.put("cardId", card.getId());
            cardProgress.put("cardTitle", card.getTitle());
            progressList.add(cardProgress);
        }

        return progressList;
    }

    /**
     * Reset progress for a user on a specific section
     */
    @Transactional
    public void resetSectionProgress(java.util.UUID userId, Long sectionId) {
        progressRepository.deleteByUserIdAndCardSectionId(userId, sectionId);
    }

}
