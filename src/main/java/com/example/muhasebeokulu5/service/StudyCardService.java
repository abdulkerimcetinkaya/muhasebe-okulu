package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.*;
import com.example.muhasebeokulu5.entities.CardSection;
import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.entities.Quiz;
import com.example.muhasebeokulu5.entities.StudyCard;
import com.example.muhasebeokulu5.repository.CardSectionRepository;
import com.example.muhasebeokulu5.repository.ProblemRepository;
import com.example.muhasebeokulu5.repository.QuizRepository;
import com.example.muhasebeokulu5.repository.StudyCardRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyCardService {

    private final StudyCardRepository studyCardRepository;
    private final CardSectionRepository cardSectionRepository;
    private final ProblemRepository problemRepository;
    private final QuizRepository quizRepository;
    private final ModelMapper modelMapper;

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
     * Map CardSection to DTO with related entity details
     */
    private CardSectionDTO mapCardSectionWithRelatedEntities(CardSection section) {
        CardSectionDTO dto = modelMapper.map(section, CardSectionDTO.class);
        dto.setContentType(section.getContentType().name());

        // Fetch and attach related entities based on content type
        switch (section.getContentType()) {
            case PROBLEM:
                if (section.getRelatedProblemId() != null) {
                    problemRepository.findById(section.getRelatedProblemId())
                        .ifPresent(problem -> {
                            ProblemDTO problemDTO = modelMapper.map(problem, ProblemDTO.class);
                            dto.setRelatedProblem(problemDTO);
                        });
                }
                break;
            case QUIZ:
                if (section.getRelatedQuizId() != null) {
                    quizRepository.findById(section.getRelatedQuizId())
                        .ifPresent(quiz -> {
                            QuizDTO quizDTO = modelMapper.map(quiz, QuizDTO.class);
                            dto.setRelatedQuiz(quizDTO);
                        });
                }
                break;
            case TEXT:
            default:
                // Content field is already mapped
                break;
        }

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

        // Create new CardSection entity
        CardSection section = new CardSection();
        section.setStudyCard(studyCard);
        section.setTitle(dto.getTitle());
        section.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        section.setContentType(CardSection.ContentType.valueOf(dto.getContentType()));
        section.setContent(dto.getContent());
        section.setRelatedProblemId(dto.getRelatedProblemId());
        section.setRelatedQuizId(dto.getRelatedQuizId());
        section.setIsActive(dto.getActive() != null ? dto.getActive() : true);

        return cardSectionRepository.save(section);
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

        existing.setTitle(dto.getTitle());
        existing.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        existing.setContentType(CardSection.ContentType.valueOf(dto.getContentType()));
        existing.setContent(dto.getContent());
        existing.setRelatedProblemId(dto.getRelatedProblemId());
        existing.setRelatedQuizId(dto.getRelatedQuizId());
        existing.setIsActive(dto.getActive() != null ? dto.getActive() : true);

        return cardSectionRepository.save(existing);
    }

    @Transactional
    public void deleteCardSection(Long id) {
        CardSection section = cardSectionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Card section not found: " + id));
        section.setIsActive(false);
        cardSectionRepository.save(section);
    }
}
