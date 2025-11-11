package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.*;
import com.example.muhasebeokulu5.entities.*;
import com.example.muhasebeokulu5.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final TopicRepository topicRepository;
    private final UserQuizAnswerRepository userQuizAnswerRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    // ==================== Admin CRUD Operations ====================

    @Transactional
    public QuizDTO createQuiz(QuizDTO quizDTO) {
        Quiz quiz = new Quiz();
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTimeLimitMinutes(quizDTO.getTimeLimitMinutes());
        quiz.setDifficulty(quizDTO.getDifficulty());
        quiz.setPassPercentage(quizDTO.getPassPercentage());
        quiz.setIsActive(quizDTO.getIsActive() != null ? quizDTO.getIsActive() : true);
        quiz.setCreatedBy(quizDTO.getCreatedBy());

        if (quizDTO.getTopicId() != null) {
            Topic topic = topicRepository.findById(quizDTO.getTopicId())
                    .orElseThrow(() -> new RuntimeException("Konu bulunamadı"));
            quiz.setTopic(topic);
        }

        Quiz savedQuiz = quizRepository.save(quiz);
        return convertToDTO(savedQuiz);
    }

    @Transactional
    public QuizDTO updateQuiz(Long id, QuizDTO quizDTO) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz bulunamadı"));

        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTimeLimitMinutes(quizDTO.getTimeLimitMinutes());
        quiz.setDifficulty(quizDTO.getDifficulty());
        quiz.setPassPercentage(quizDTO.getPassPercentage());
        quiz.setIsActive(quizDTO.getIsActive());

        if (quizDTO.getTopicId() != null) {
            Topic topic = topicRepository.findById(quizDTO.getTopicId())
                    .orElseThrow(() -> new RuntimeException("Konu bulunamadı"));
            quiz.setTopic(topic);
        }

        Quiz updatedQuiz = quizRepository.save(quiz);
        return convertToDTO(updatedQuiz);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz bulunamadı"));
        quizRepository.delete(quiz);
    }

    public QuizDTO getQuizById(Long id) {
        try {
            System.out.println("🔍 DEBUG: Getting quiz with ID: " + id);

            // N+1 Query Prevention: Use fetch join to load questions and options eagerly
            Quiz quiz = quizRepository.findByIdWithQuestionsAndOptions(id);

            if (quiz == null) {
                System.out.println("❌ DEBUG: Quiz not found with ID: " + id);
                throw new RuntimeException("Quiz bulunamadı: ID=" + id);
            }

            System.out.println("✅ DEBUG: Quiz found: " + quiz.getTitle());
            System.out.println("📋 DEBUG: Questions count: " + (quiz.getQuestions() != null ? quiz.getQuestions().size() : "null"));

            QuizDTO dto = convertToDTOWithQuestions(quiz);

            System.out.println("✅ DEBUG: DTO created successfully");
            return dto;

        } catch (Exception e) {
            System.err.println("💥 ERROR in getQuizById: " + e.getClass().getName());
            System.err.println("💥 ERROR message: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Quiz yüklenirken hata: " + e.getMessage(), e);
        }
    }

    public Page<QuizDTO> getAllQuizzes(Pageable pageable) {
        return quizRepository.findAll(pageable).map(this::convertToDTO);
    }

    public List<QuizDTO> getActiveQuizzes() {
        // Fetch with questions to calculate stats
        List<Quiz> activeQuizzes = quizRepository.findActiveQuizzesWithQuestions();

        if (activeQuizzes == null) {
            return new ArrayList<>();
        }

        return activeQuizzes.stream()
                .map(this::convertToDTOSimple)
                .collect(Collectors.toList());
    }

    // ==================== Question Management ====================

    @Transactional
    public QuestionDTO addQuestion(QuestionDTO questionDTO) {
        Quiz quiz = quizRepository.findById(questionDTO.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz bulunamadı"));

        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestionText(questionDTO.getQuestionText());
        question.setQuestionOrder(questionDTO.getQuestionOrder());
        question.setPoints(questionDTO.getPoints());

        Question savedQuestion = questionRepository.save(question);

        // Add options
        if (questionDTO.getOptions() != null && !questionDTO.getOptions().isEmpty()) {
            for (OptionDTO optionDTO : questionDTO.getOptions()) {
                Option option = new Option();
                option.setQuestion(savedQuestion);
                option.setOptionText(optionDTO.getOptionText());
                option.setIsCorrect(optionDTO.getIsCorrect());
                option.setOptionOrder(optionDTO.getOptionOrder());
                optionRepository.save(option);
            }
        }

        return modelMapper.map(savedQuestion, QuestionDTO.class);
    }

    @Transactional
    public QuestionDTO updateQuestion(Long id, QuestionDTO questionDTO) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Soru bulunamadı"));

        question.setQuestionText(questionDTO.getQuestionText());
        question.setQuestionOrder(questionDTO.getQuestionOrder());
        question.setPoints(questionDTO.getPoints());

        Question updatedQuestion = questionRepository.save(question);
        return modelMapper.map(updatedQuestion, QuestionDTO.class);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Soru bulunamadı"));
        questionRepository.delete(question);
    }

    // ==================== Student Operations ====================

    public QuizDTO getQuizForStudent(Long quizId) {
        // N+1 Query Prevention: Use fetch join to load questions and options eagerly
        Quiz quiz = quizRepository.findByIdWithQuestionsAndOptions(quizId);
        if (quiz == null) {
            throw new RuntimeException("Quiz bulunamadı");
        }

        if (!quiz.getIsActive()) {
            throw new RuntimeException("Bu quiz aktif değil");
        }

        return convertToDTOWithQuestionsForStudent(quiz);
    }

    @Transactional
    public QuizResultDTO submitQuiz(QuizSubmissionDTO submissionDTO) {
        Quiz quiz = quizRepository.findById(submissionDTO.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz bulunamadı"));

        User user = userRepository.findById(submissionDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        // Check if already submitted
        if (userQuizAnswerRepository.existsByUserAndQuiz(user, quiz)) {
            throw new RuntimeException("Bu quiz zaten çözülmüş");
        }

        List<UserQuizAnswer> answers = new ArrayList<>();
        int correctCount = 0;
        int totalPoints = 0;
        int earnedPoints = 0;

        List<QuizResultDTO.QuestionResultDTO> questionResults = new ArrayList<>();

        for (QuizSubmissionDTO.AnswerDTO answerDTO : submissionDTO.getAnswers()) {
            Question question = questionRepository.findById(answerDTO.getQuestionId())
                    .orElseThrow(() -> new RuntimeException("Soru bulunamadı"));

            Option selectedOption = optionRepository.findById(answerDTO.getSelectedOptionId())
                    .orElseThrow(() -> new RuntimeException("Şık bulunamadı"));

            Option correctOption = optionRepository.findByQuestionAndIsCorrectTrue(question)
                    .orElseThrow(() -> new RuntimeException("Doğru cevap bulunamadı"));

            boolean isCorrect = selectedOption.getIsCorrect();
            int points = isCorrect ? question.getPoints() : 0;

            if (isCorrect) {
                correctCount++;
                earnedPoints += points;
            }

            totalPoints += question.getPoints();

            UserQuizAnswer userAnswer = new UserQuizAnswer();
            userAnswer.setUser(user);
            userAnswer.setQuiz(quiz);
            userAnswer.setQuestion(question);
            userAnswer.setSelectedOption(selectedOption);
            userAnswer.setIsCorrect(isCorrect);
            userAnswer.setPointsEarned(points);
            userAnswer.setAnsweredAt(LocalDateTime.now());

            answers.add(userAnswer);

            // Add to results
            QuizResultDTO.QuestionResultDTO questionResult = new QuizResultDTO.QuestionResultDTO();
            questionResult.setQuestionId(question.getId());
            questionResult.setQuestionText(question.getQuestionText());
            questionResult.setSelectedOptionId(selectedOption.getId());
            questionResult.setSelectedOptionText(selectedOption.getOptionText());
            questionResult.setCorrectOptionId(correctOption.getId());
            questionResult.setCorrectOptionText(correctOption.getOptionText());
            questionResult.setIsCorrect(isCorrect);
            questionResult.setPoints(question.getPoints());
            questionResult.setEarnedPoints(points);

            questionResults.add(questionResult);
        }

        userQuizAnswerRepository.saveAll(answers);

        // Calculate result
        QuizResultDTO result = new QuizResultDTO();
        result.setQuizId(quiz.getId());
        result.setQuizTitle(quiz.getTitle());
        result.setUserId(user.getId());
        result.setUsername(user.getUsername());
        result.setTotalQuestions(submissionDTO.getAnswers().size());
        result.setCorrectAnswers(correctCount);
        result.setWrongAnswers(submissionDTO.getAnswers().size() - correctCount);
        result.setTotalPoints(totalPoints);
        result.setEarnedPoints(earnedPoints);
        result.setPercentage((double) earnedPoints / totalPoints * 100);
        result.setPassed(result.getPercentage() >= quiz.getPassPercentage());
        result.setCompletedAt(LocalDateTime.now());
        result.setQuestionResults(questionResults);

        return result;
    }

    public List<QuizDTO> getCompletedQuizzes(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        List<Quiz> completedQuizzes = userQuizAnswerRepository.findCompletedQuizzesByUser(user);
        return completedQuizzes.stream()
                .map(quiz -> {
                    QuizDTO dto = convertToDTOSimple(quiz);
                    // Add user's score for completed quiz
                    Integer userScore = userQuizAnswerRepository.calculateTotalScoreForUserQuiz(user, quiz);
                    dto.setUserScore(userScore != null ? userScore : 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private QuizDTO convertToDTOSimple(Quiz quiz) {
        // Minimal mapping for list views - now includes stats calculation
        QuizDTO dto = new QuizDTO();

        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
        dto.setDifficulty(quiz.getDifficulty());
        dto.setPassPercentage(quiz.getPassPercentage());
        dto.setIsActive(quiz.getIsActive());
        dto.setCreatedBy(quiz.getCreatedBy());
        dto.setCreatedAt(quiz.getCreatedAt());
        dto.setUpdatedAt(quiz.getUpdatedAt());

        // Calculate question count and total points from loaded questions
        if (quiz.getQuestions() != null) {
            dto.setQuestionCount(quiz.getQuestions().size());
            dto.setTotalPoints(quiz.getQuestions().stream()
                    .mapToInt(q -> q.getPoints() != null ? q.getPoints() : 0)
                    .sum());
        } else {
            dto.setQuestionCount(0);
            dto.setTotalPoints(0);
        }

        // Set topic info if available
        if (quiz.getTopic() != null) {
            dto.setTopicId(quiz.getTopic().getId());
            dto.setTopicName(quiz.getTopic().getName());
        }

        // Don't include full question list in simple view
        dto.setQuestions(null);

        return dto;
    }

    private QuizDTO convertToDTO(Quiz quiz) {
        // Manual mapping to avoid ModelMapper Set->List conversion issues
        QuizDTO dto = new QuizDTO();

        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setTimeLimitMinutes(quiz.getTimeLimitMinutes());
        dto.setDifficulty(quiz.getDifficulty());
        dto.setPassPercentage(quiz.getPassPercentage());
        dto.setIsActive(quiz.getIsActive());
        dto.setCreatedBy(quiz.getCreatedBy());
        dto.setCreatedAt(quiz.getCreatedAt());
        dto.setUpdatedAt(quiz.getUpdatedAt());

        // Questions list should be null for list views (only populated in detail view)
        dto.setQuestions(null);

        // Safely handle Topic (may be null or lazy-loaded)
        try {
            if (quiz.getTopic() != null) {
                dto.setTopicId(quiz.getTopic().getId());
                dto.setTopicName(quiz.getTopic().getName());
            }
        } catch (Exception e) {
            // Topic lazy loading failed, set to null
            dto.setTopicId(null);
            dto.setTopicName(null);
        }

        // Safely handle Questions (may be lazy-loaded)
        try {
            if (quiz.getQuestions() != null) {
                dto.setQuestionCount(quiz.getQuestions().size());
                dto.setTotalPoints(quiz.getQuestions().stream()
                        .mapToInt(Question::getPoints)
                        .sum());
            } else {
                dto.setQuestionCount(0);
                dto.setTotalPoints(0);
            }
        } catch (Exception e) {
            // Questions lazy loading failed
            dto.setQuestionCount(0);
            dto.setTotalPoints(0);
        }

        return dto;
    }

    private QuizDTO convertToDTOWithQuestions(Quiz quiz) {
        QuizDTO dto = convertToDTO(quiz);

        // Safely handle Questions
        try {
            if (quiz.getQuestions() != null && !quiz.getQuestions().isEmpty()) {
                List<QuestionDTO> questionDTOs = quiz.getQuestions().stream()
                        .sorted((q1, q2) -> {
                            // Sort by questionOrder if available, otherwise by ID
                            if (q1.getQuestionOrder() != null && q2.getQuestionOrder() != null) {
                                return q1.getQuestionOrder().compareTo(q2.getQuestionOrder());
                            }
                            return q1.getId().compareTo(q2.getId());
                        })
                        .map(this::convertQuestionToDTO)
                        .collect(Collectors.toList());
                dto.setQuestions(questionDTOs);
            } else {
                dto.setQuestions(new ArrayList<>());
            }
        } catch (Exception e) {
            // Questions lazy loading failed
            dto.setQuestions(new ArrayList<>());
        }

        return dto;
    }

    private QuizDTO convertToDTOWithQuestionsForStudent(Quiz quiz) {
        QuizDTO dto = convertToDTO(quiz);

        // Safely handle Questions
        try {
            if (quiz.getQuestions() != null && !quiz.getQuestions().isEmpty()) {
                List<QuestionDTO> questionDTOs = quiz.getQuestions().stream()
                        .sorted((q1, q2) -> {
                            // Sort by questionOrder if available, otherwise by ID
                            if (q1.getQuestionOrder() != null && q2.getQuestionOrder() != null) {
                                return q1.getQuestionOrder().compareTo(q2.getQuestionOrder());
                            }
                            return q1.getId().compareTo(q2.getId());
                        })
                        .map(this::convertQuestionToDTOForStudent)
                        .collect(Collectors.toList());
                dto.setQuestions(questionDTOs);
            } else {
                dto.setQuestions(new ArrayList<>());
            }
        } catch (Exception e) {
            // Questions lazy loading failed
            dto.setQuestions(new ArrayList<>());
        }

        return dto;
    }

    private QuestionDTO convertQuestionToDTO(Question question) {
        QuestionDTO dto = modelMapper.map(question, QuestionDTO.class);
        dto.setQuizId(question.getQuiz().getId());
        List<OptionDTO> optionDTOs = question.getOptions().stream()
                .sorted((o1, o2) -> {
                    // Sort by optionOrder if available, otherwise by ID
                    if (o1.getOptionOrder() != null && o2.getOptionOrder() != null) {
                        return o1.getOptionOrder().compareTo(o2.getOptionOrder());
                    }
                    return o1.getId().compareTo(o2.getId());
                })
                .map(option -> modelMapper.map(option, OptionDTO.class))
                .collect(Collectors.toList());
        dto.setOptions(optionDTOs);
        return dto;
    }

    private QuestionDTO convertQuestionToDTOForStudent(Question question) {
        QuestionDTO dto = modelMapper.map(question, QuestionDTO.class);
        dto.setQuizId(question.getQuiz().getId());
        // Don't include isCorrect field for students
        List<OptionDTO> optionDTOs = question.getOptions().stream()
                .sorted((o1, o2) -> {
                    // Sort by optionOrder if available, otherwise by ID
                    if (o1.getOptionOrder() != null && o2.getOptionOrder() != null) {
                        return o1.getOptionOrder().compareTo(o2.getOptionOrder());
                    }
                    return o1.getId().compareTo(o2.getId());
                })
                .map(option -> {
                    OptionDTO optionDTO = new OptionDTO();
                    optionDTO.setId(option.getId());
                    optionDTO.setQuestionId(option.getQuestion().getId());
                    optionDTO.setOptionText(option.getOptionText());
                    optionDTO.setOptionOrder(option.getOptionOrder());
                    // Don't send isCorrect to students
                    return optionDTO;
                })
                .collect(Collectors.toList());
        dto.setOptions(optionDTOs);
        return dto;
    }

    @Transactional
    public BulkQuestionImportDTO.ImportResult bulkImportQuestions(BulkQuestionImportDTO bulkImportDTO) {
        List<BulkQuestionImportDTO.ImportError> errors = new ArrayList<>();
        int successCount = 0;
        int totalQuestions = bulkImportDTO.getQuestions().size();

        // Verify quiz exists once
        Quiz quiz = quizRepository.findById(bulkImportDTO.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz bulunamadı: ID = " + bulkImportDTO.getQuizId()));

        // Get existing questions for duplicate check
        Set<Question> existingQuestionsSet = quiz.getQuestions();
        Set<String> existingQuestionTexts = existingQuestionsSet.stream()
                .map(q -> q.getQuestionText().trim().toLowerCase())
                .collect(Collectors.toSet());

        // Find max questionOrder for auto-increment
        int maxOrder = existingQuestionsSet.stream()
                .map(Question::getQuestionOrder)
                .filter(order -> order != null)
                .max(Integer::compareTo)
                .orElse(0);

        int currentOrder = maxOrder;

        for (int i = 0; i < totalQuestions; i++) {
            BulkQuestionImportDTO.QuestionImportItem questionItem = bulkImportDTO.getQuestions().get(i);

            try {
                // Check for duplicate question text
                String normalizedText = questionItem.getQuestionText().trim().toLowerCase();
                if (existingQuestionTexts.contains(normalizedText)) {
                    BulkQuestionImportDTO.ImportError error = new BulkQuestionImportDTO.ImportError(
                            i,
                            questionItem.getQuestionText().length() > 50
                                    ? questionItem.getQuestionText().substring(0, 50) + "..."
                                    : questionItem.getQuestionText(),
                            "Bu soru quiz'de zaten mevcut"
                    );
                    errors.add(error);
                    continue; // Skip this question
                }

                // Create Question entity
                Question question = new Question();
                question.setQuiz(quiz);
                question.setQuestionText(questionItem.getQuestionText());

                // Auto-increment questionOrder (always auto-assign)
                currentOrder++;
                question.setQuestionOrder(currentOrder);
                question.setPoints(questionItem.getPoints());

                // Save question
                Question savedQuestion = questionRepository.save(question);

                // Add to existing set to prevent duplicates within this import
                existingQuestionTexts.add(normalizedText);

                // Add options
                if (questionItem.getOptions() != null && !questionItem.getOptions().isEmpty()) {
                    for (BulkQuestionImportDTO.OptionImportItem optionItem : questionItem.getOptions()) {
                        Option option = new Option();
                        option.setQuestion(savedQuestion);
                        option.setOptionText(optionItem.getOptionText());
                        option.setIsCorrect(optionItem.getIsCorrect());
                        option.setOptionOrder(optionItem.getOptionOrder());
                        optionRepository.save(option);
                    }
                }

                successCount++;
            } catch (Exception e) {
                // Add error to list
                BulkQuestionImportDTO.ImportError error = new BulkQuestionImportDTO.ImportError(
                        i,
                        questionItem.getQuestionText().length() > 50
                                ? questionItem.getQuestionText().substring(0, 50) + "..."
                                : questionItem.getQuestionText(),
                        e.getMessage()
                );
                errors.add(error);
            }
        }

        int failureCount = totalQuestions - successCount;
        return new BulkQuestionImportDTO.ImportResult(totalQuestions, successCount, failureCount, errors);
    }
}
