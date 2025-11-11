package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.*;
import com.example.muhasebeokulu5.entities.*;
import com.example.muhasebeokulu5.repository.*;
import com.example.muhasebeokulu5.util.HtmlSanitizer;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing ContentItems - the core of mixed content system
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContentItemService {

    private final ContentItemRepository contentItemRepository;
    private final CardSectionRepository cardSectionRepository;
    private final StudyProblemRepository studyProblemRepository;
    private final StudyQuizRepository studyQuizRepository;
    private final ProblemRepository problemRepository;
    private final QuizRepository quizRepository;
    private final ModelMapper modelMapper;
    private final HtmlSanitizer htmlSanitizer;

    /**
     * Get all content items for a section
     */
    public List<ContentItemDTO> getContentItems(Long cardSectionId) {
        List<ContentItem> items = contentItemRepository
                .findByCardSectionIdAndIsActiveTrueOrderByDisplayOrderAsc(cardSectionId);

        return items.stream()
                .map(this::mapContentItemToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a single content item
     */
    public ContentItemDTO getContentItem(Long id) {
        ContentItem item = contentItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content item not found: " + id));

        return mapContentItemToDTO(item);
    }

    /**
     * Create a new content item
     */
    @Transactional
    public ContentItemDTO createContentItem(ContentItemDTO dto) {
        CardSection section = cardSectionRepository.findById(dto.getCardSectionId())
                .orElseThrow(() -> new RuntimeException("Card section not found: " + dto.getCardSectionId()));

        ContentItem item = new ContentItem();
        item.setCardSection(section);

        // Validate and set content type
        if (dto.getContentType() == null || dto.getContentType().trim().isEmpty()) {
            throw new RuntimeException("ContentType cannot be null or empty. Received: " + dto);
        }

        try {
            item.setContentType(ContentItem.ContentType.valueOf(dto.getContentType().trim().toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid ContentType: '" + dto.getContentType() + "'. Valid types are: TEXT, PROBLEM, QUIZ, STUDY_PROBLEM, STUDY_QUIZ, PARAGRAPH, HEADING, LIST, TABLE, DIVIDER, CODE, QUOTE, CALLOUT");
        }
        item.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);

        // Sanitize HTML content for TEXT type to prevent XSS attacks
        if (dto.getTextContent() != null && !dto.getTextContent().isEmpty()) {
            item.setTextContent(htmlSanitizer.sanitize(dto.getTextContent()));
        } else {
            item.setTextContent(dto.getTextContent());
        }

        // Set block data for structured content
        item.setBlockData(dto.getBlockData());

        item.setRelatedProblemId(dto.getRelatedProblemId());
        item.setRelatedQuizId(dto.getRelatedQuizId());
        item.setIsActive(dto.getActive() != null ? dto.getActive() : true);

        item = contentItemRepository.save(item);

        // Create embedded content based on type
        if (ContentItem.ContentType.STUDY_PROBLEM.equals(item.getContentType()) && dto.getStudyProblem() != null) {
            StudyProblem problem = createStudyProblemFromDTO(item, dto.getStudyProblem());
            item.setStudyProblem(problem);
        } else if (ContentItem.ContentType.STUDY_QUIZ.equals(item.getContentType()) && dto.getStudyQuiz() != null) {
            StudyQuiz quiz = createStudyQuizFromDTO(item, dto.getStudyQuiz());
            item.setStudyQuiz(quiz);
        }

        return mapContentItemToDTO(item);
    }

    /**
     * Update an existing content item
     */
    @Transactional
    public ContentItemDTO updateContentItem(Long id, ContentItemDTO dto) {
        ContentItem item = contentItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content item not found: " + id));

        ContentItem.ContentType oldType = item.getContentType();
        ContentItem.ContentType newType = ContentItem.ContentType.valueOf(dto.getContentType());

        item.setContentType(newType);
        item.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : item.getDisplayOrder());

        // Sanitize HTML content for TEXT type to prevent XSS attacks
        if (dto.getTextContent() != null && !dto.getTextContent().isEmpty()) {
            item.setTextContent(htmlSanitizer.sanitize(dto.getTextContent()));
        } else {
            item.setTextContent(dto.getTextContent());
        }

        // Set block data for structured content
        item.setBlockData(dto.getBlockData());

        item.setRelatedProblemId(dto.getRelatedProblemId());
        item.setRelatedQuizId(dto.getRelatedQuizId());
        item.setIsActive(dto.getActive() != null ? dto.getActive() : item.getIsActive());

        // If type changed, clean up old embedded content
        if (oldType != newType) {
            if (oldType == ContentItem.ContentType.STUDY_PROBLEM && item.getStudyProblem() != null) {
                studyProblemRepository.delete(item.getStudyProblem());
                item.setStudyProblem(null);
            }
            if (oldType == ContentItem.ContentType.STUDY_QUIZ && item.getStudyQuiz() != null) {
                studyQuizRepository.delete(item.getStudyQuiz());
                item.setStudyQuiz(null);
            }
        }

        item = contentItemRepository.save(item);

        // Update or create embedded content
        if (newType == ContentItem.ContentType.STUDY_PROBLEM && dto.getStudyProblem() != null) {
            if (item.getStudyProblem() != null) {
                updateStudyProblemFromDTO(item.getStudyProblem(), dto.getStudyProblem());
            } else {
                StudyProblem problem = createStudyProblemFromDTO(item, dto.getStudyProblem());
                item.setStudyProblem(problem);
            }
        } else if (newType == ContentItem.ContentType.STUDY_QUIZ && dto.getStudyQuiz() != null) {
            if (item.getStudyQuiz() != null) {
                updateStudyQuizFromDTO(item.getStudyQuiz(), dto.getStudyQuiz());
            } else {
                StudyQuiz quiz = createStudyQuizFromDTO(item, dto.getStudyQuiz());
                item.setStudyQuiz(quiz);
            }
        }

        return mapContentItemToDTO(item);
    }

    /**
     * Delete a content item
     */
    @Transactional
    public void deleteContentItem(Long id) {
        ContentItem item = contentItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content item not found: " + id));
        item.setIsActive(false);
        contentItemRepository.save(item);
    }

    /**
     * Reorder content items
     */
    @Transactional
    public void reorderContentItems(Long cardSectionId, List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            final Long itemId = orderedIds.get(i);  // ← Bu satırı ekle
            final int displayOrder = i;              // ← Bu satırı ekle
            ContentItem item = contentItemRepository.findById(itemId)  // ← orderedIds.get(i) yerine itemId
                    .orElseThrow(() -> new RuntimeException("Content item not found: " + itemId));  // ← orderedIds.get(i) yerine itemId
            item.setDisplayOrder(displayOrder);      // ← i yerine displayOrder
            contentItemRepository.save(item);
        }
    }


    /**
     * Map ContentItem to DTO with all related data
     */
    private ContentItemDTO mapContentItemToDTO(ContentItem item) {
        ContentItemDTO dto = modelMapper.map(item, ContentItemDTO.class);
        dto.setContentType(item.getContentType().name());
        dto.setActive(item.getIsActive());
        dto.setBlockData(item.getBlockData());

        // Load related content based on type
        switch (item.getContentType()) {
            case TEXT:
                // Text content already mapped
                break;

            case PROBLEM:
                if (item.getRelatedProblemId() != null) {
                    problemRepository.findById(item.getRelatedProblemId())
                            .ifPresent(problem -> {
                                ProblemDTO problemDTO = modelMapper.map(problem, ProblemDTO.class);
                                dto.setRelatedProblem(problemDTO);
                            });
                }
                break;

            case QUIZ:
                if (item.getRelatedQuizId() != null) {
                    quizRepository.findById(item.getRelatedQuizId())
                            .ifPresent(quiz -> {
                                QuizDTO quizDTO = modelMapper.map(quiz, QuizDTO.class);
                                dto.setRelatedQuiz(quizDTO);
                            });
                }
                break;

            case STUDY_PROBLEM:
                if (item.getStudyProblem() != null) {
                    StudyProblemDTO problemDTO = mapStudyProblemToDTO(item.getStudyProblem());
                    dto.setStudyProblem(problemDTO);
                }
                break;

            case STUDY_QUIZ:
                if (item.getStudyQuiz() != null) {
                    StudyQuizDTO quizDTO = mapStudyQuizToDTO(item.getStudyQuiz());
                    dto.setStudyQuiz(quizDTO);
                }
                break;
        }

        return dto;
    }

    // Helper methods for StudyProblem
    private StudyProblemDTO mapStudyProblemToDTO(StudyProblem studyProblem) {
        StudyProblemDTO dto = modelMapper.map(studyProblem, StudyProblemDTO.class);
        List<StudyProblemEntryDTO> entryDTOs = studyProblem.getCorrectEntries().stream()
                .map(entry -> modelMapper.map(entry, StudyProblemEntryDTO.class))
                .collect(Collectors.toList());
        dto.setCorrectEntries(entryDTOs);
        return dto;
    }

    private StudyProblem createStudyProblemFromDTO(ContentItem contentItem, StudyProblemDTO dto) {
        StudyProblem studyProblem = new StudyProblem();
        studyProblem.setContentItem(contentItem);
        studyProblem.setTitle(dto.getTitle());
        studyProblem.setContent(dto.getContent());
        studyProblem.setHint(dto.getHint());
        studyProblem.setDifficulty(dto.getDifficulty());

        studyProblem = studyProblemRepository.save(studyProblem);

        if (dto.getCorrectEntries() != null) {
            for (StudyProblemEntryDTO entryDTO : dto.getCorrectEntries()) {
                StudyProblemEntry entry = new StudyProblemEntry();
                entry.setStudyProblem(studyProblem);
                entry.setAccountCode(entryDTO.getAccountCode());
                entry.setAccountName(entryDTO.getAccountName());
                entry.setDebitAmount(entryDTO.getDebitAmount());
                entry.setCreditAmount(entryDTO.getCreditAmount());
                entry.setExplanation(entryDTO.getExplanation());
                studyProblem.getCorrectEntries().add(entry);
            }
            studyProblemRepository.save(studyProblem);
        }

        return studyProblem;
    }

    private void updateStudyProblemFromDTO(StudyProblem studyProblem, StudyProblemDTO dto) {
        studyProblem.setTitle(dto.getTitle());
        studyProblem.setContent(dto.getContent());
        studyProblem.setHint(dto.getHint());
        studyProblem.setDifficulty(dto.getDifficulty());

        studyProblem.getCorrectEntries().clear();

        if (dto.getCorrectEntries() != null) {
            for (StudyProblemEntryDTO entryDTO : dto.getCorrectEntries()) {
                StudyProblemEntry entry = new StudyProblemEntry();
                entry.setStudyProblem(studyProblem);
                entry.setAccountCode(entryDTO.getAccountCode());
                entry.setAccountName(entryDTO.getAccountName());
                entry.setDebitAmount(entryDTO.getDebitAmount());
                entry.setCreditAmount(entryDTO.getCreditAmount());
                entry.setExplanation(entryDTO.getExplanation());
                studyProblem.getCorrectEntries().add(entry);
            }
        }

        studyProblemRepository.save(studyProblem);
    }

    // Helper methods for StudyQuiz
    private StudyQuizDTO mapStudyQuizToDTO(StudyQuiz studyQuiz) {
        StudyQuizDTO dto = modelMapper.map(studyQuiz, StudyQuizDTO.class);
        List<StudyQuestionDTO> questionDTOs = studyQuiz.getQuestions().stream()
                .map(this::mapStudyQuestionToDTO)
                .collect(Collectors.toList());
        dto.setQuestions(questionDTOs);
        return dto;
    }

    private StudyQuestionDTO mapStudyQuestionToDTO(StudyQuestion studyQuestion) {
        StudyQuestionDTO dto = modelMapper.map(studyQuestion, StudyQuestionDTO.class);
        List<StudyQuestionOptionDTO> optionDTOs = studyQuestion.getOptions().stream()
                .map(option -> modelMapper.map(option, StudyQuestionOptionDTO.class))
                .collect(Collectors.toList());
        dto.setOptions(optionDTOs);
        return dto;
    }

    private StudyQuiz createStudyQuizFromDTO(ContentItem contentItem, StudyQuizDTO dto) {
        StudyQuiz studyQuiz = new StudyQuiz();
        studyQuiz.setContentItem(contentItem);
        studyQuiz.setTitle(dto.getTitle());
        studyQuiz.setDescription(dto.getDescription());
        studyQuiz.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        studyQuiz.setPassPercentage(dto.getPassPercentage());

        studyQuiz = studyQuizRepository.save(studyQuiz);

        if (dto.getQuestions() != null) {
            for (StudyQuestionDTO questionDTO : dto.getQuestions()) {
                StudyQuestion question = new StudyQuestion();
                question.setStudyQuiz(studyQuiz);
                question.setQuestionText(questionDTO.getQuestionText());
                question.setQuestionType(questionDTO.getQuestionType());
                question.setDisplayOrder(questionDTO.getDisplayOrder());
                question.setPoints(questionDTO.getPoints());

                if (questionDTO.getOptions() != null) {
                    for (StudyQuestionOptionDTO optionDTO : questionDTO.getOptions()) {
                        StudyQuestionOption option = new StudyQuestionOption();
                        option.setStudyQuestion(question);
                        option.setOptionText(optionDTO.getOptionText());
                        option.setIsCorrect(optionDTO.getIsCorrect());
                        option.setDisplayOrder(optionDTO.getDisplayOrder());
                        option.setExplanation(optionDTO.getExplanation());
                        question.getOptions().add(option);
                    }
                }

                studyQuiz.getQuestions().add(question);
            }
            studyQuizRepository.save(studyQuiz);
        }

        return studyQuiz;
    }

    private void updateStudyQuizFromDTO(StudyQuiz studyQuiz, StudyQuizDTO dto) {
        studyQuiz.setTitle(dto.getTitle());
        studyQuiz.setDescription(dto.getDescription());
        studyQuiz.setTimeLimitMinutes(dto.getTimeLimitMinutes());
        studyQuiz.setPassPercentage(dto.getPassPercentage());

        studyQuiz.getQuestions().clear();

        if (dto.getQuestions() != null) {
            for (StudyQuestionDTO questionDTO : dto.getQuestions()) {
                StudyQuestion question = new StudyQuestion();
                question.setStudyQuiz(studyQuiz);
                question.setQuestionText(questionDTO.getQuestionText());
                question.setQuestionType(questionDTO.getQuestionType());
                question.setDisplayOrder(questionDTO.getDisplayOrder());
                question.setPoints(questionDTO.getPoints());

                if (questionDTO.getOptions() != null) {
                    for (StudyQuestionOptionDTO optionDTO : questionDTO.getOptions()) {
                        StudyQuestionOption option = new StudyQuestionOption();
                        option.setStudyQuestion(question);
                        option.setOptionText(optionDTO.getOptionText());
                        option.setIsCorrect(optionDTO.getIsCorrect());
                        option.setDisplayOrder(optionDTO.getDisplayOrder());
                        option.setExplanation(optionDTO.getExplanation());
                        question.getOptions().add(option);
                    }
                }

                studyQuiz.getQuestions().add(question);
            }
        }

        studyQuizRepository.save(studyQuiz);
    }
}
