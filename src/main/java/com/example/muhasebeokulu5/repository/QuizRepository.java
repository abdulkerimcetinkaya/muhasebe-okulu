package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.Quiz;
import com.example.muhasebeokulu5.entities.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByIsActiveTrue();

    Page<Quiz> findByIsActiveTrue(Pageable pageable);

    List<Quiz> findByTopicAndIsActiveTrue(Topic topic);

    List<Quiz> findByDifficultyAndIsActiveTrue(Integer difficulty);

    @Query("SELECT q FROM Quiz q WHERE q.isActive = true AND " +
           "(LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Quiz> searchActiveQuizzes(@Param("search") String search, Pageable pageable);

    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :id")
    Quiz findByIdWithQuestions(@Param("id") Long id);
}
