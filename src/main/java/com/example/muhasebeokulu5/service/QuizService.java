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
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz bulunamadı"));
        return convertToDTOWithQuestions(quiz);
    }

    public Page<QuizDTO> getAllQuizzes(Pageable pageable) {
        return quizRepository.findAll(pageable).map(this::convertToDTO);
    }

    public List<QuizDTO> getActiveQuizzes() {
        return quizRepository.findByIsActiveTrue().stream()
                .map(this::convertToDTO)
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
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz bulunamadı"));

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
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private QuizDTO convertToDTO(Quiz quiz) {
        QuizDTO dto = modelMapper.map(quiz, QuizDTO.class);
        if (quiz.getTopic() != null) {
            dto.setTopicId(quiz.getTopic().getId());
            dto.setTopicName(quiz.getTopic().getName());
        }
        dto.setQuestionCount(quiz.getQuestions().size());
        dto.setTotalPoints(quiz.getQuestions().stream()
                .mapToInt(Question::getPoints)
                .sum());
        return dto;
    }

    private QuizDTO convertToDTOWithQuestions(Quiz quiz) {
        QuizDTO dto = convertToDTO(quiz);
        List<QuestionDTO> questionDTOs = quiz.getQuestions().stream()
                .map(this::convertQuestionToDTO)
                .collect(Collectors.toList());
        dto.setQuestions(questionDTOs);
        return dto;
    }

    private QuizDTO convertToDTOWithQuestionsForStudent(Quiz quiz) {
        QuizDTO dto = convertToDTO(quiz);
        List<QuestionDTO> questionDTOs = quiz.getQuestions().stream()
                .map(this::convertQuestionToDTOForStudent)
                .collect(Collectors.toList());
        dto.setQuestions(questionDTOs);
        return dto;
    }

    private QuestionDTO convertQuestionToDTO(Question question) {
        QuestionDTO dto = modelMapper.map(question, QuestionDTO.class);
        dto.setQuizId(question.getQuiz().getId());
        List<OptionDTO> optionDTOs = question.getOptions().stream()
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
}
