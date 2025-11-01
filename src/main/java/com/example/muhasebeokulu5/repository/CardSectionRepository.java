package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.CardSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardSectionRepository extends JpaRepository<CardSection, Long> {

    /**
     * Find all active sections for a study card ordered by display order
     */
    List<CardSection> findByStudyCardIdAndIsActiveTrueOrderByDisplayOrderAsc(Long studyCardId);

    /**
     * Find section by ID if active
     */
    CardSection findByIdAndIsActiveTrue(Long id);
}
