package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.Question;
import com.example.muhasebeokulu5.entities.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuizOrderByQuestionOrderAsc(Quiz quiz);

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.options WHERE q.quiz.id = :quizId ORDER BY q.questionOrder")
    List<Question> findByQuizIdWithOptions(@Param("quizId") Long quizId);

    Long countByQuiz(Quiz quiz);
}
