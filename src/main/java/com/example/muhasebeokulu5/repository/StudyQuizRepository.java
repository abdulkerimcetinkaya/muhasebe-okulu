package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.StudyQuiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudyQuizRepository extends JpaRepository<StudyQuiz, Long> {

    Optional<StudyQuiz> findByContentItemId(Long contentItemId);
}
