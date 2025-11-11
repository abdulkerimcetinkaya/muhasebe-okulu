package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.StudyProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudyProblemRepository extends JpaRepository<StudyProblem, Long> {

    Optional<StudyProblem> findByContentItemId(Long contentItemId);
}
