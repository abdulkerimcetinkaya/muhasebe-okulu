package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.Quiz;
import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.entities.UserQuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserQuizAnswerRepository extends JpaRepository<UserQuizAnswer, Long> {

    List<UserQuizAnswer> findByUserAndQuiz(User user, Quiz quiz);

    @Query("SELECT DISTINCT uqa.quiz FROM UserQuizAnswer uqa WHERE uqa.user = :user")
    List<Quiz> findCompletedQuizzesByUser(@Param("user") User user);

    @Query("SELECT SUM(uqa.pointsEarned) FROM UserQuizAnswer uqa WHERE uqa.user = :user AND uqa.quiz = :quiz")
    Integer calculateTotalScoreForUserQuiz(@Param("user") User user, @Param("quiz") Quiz quiz);

    @Query("SELECT COUNT(uqa) FROM UserQuizAnswer uqa WHERE uqa.user = :user AND uqa.quiz = :quiz AND uqa.isCorrect = true")
    Long countCorrectAnswers(@Param("user") User user, @Param("quiz") Quiz quiz);

    boolean existsByUserAndQuiz(User user, Quiz quiz);
}
