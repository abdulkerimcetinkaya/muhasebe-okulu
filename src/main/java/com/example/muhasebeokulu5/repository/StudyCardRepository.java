package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.StudyCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyCardRepository extends JpaRepository<StudyCard, Long> {

    /**
     * Find all active study cards ordered by display order
     */
    List<StudyCard> findByIsActiveTrueOrderByDisplayOrderAsc();

    /**
     * Find study card by ID with sections
     */
    @Query("SELECT sc FROM StudyCard sc LEFT JOIN FETCH sc.sections WHERE sc.id = :id AND sc.isActive = true")
    StudyCard findByIdWithSections(Long id);
}
