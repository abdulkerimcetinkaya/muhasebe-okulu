package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.UserCardProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCardProgressRepository extends JpaRepository<UserCardProgress, Long> {

    /**
     * Find progress for a specific user and section
     */
    Optional<UserCardProgress> findByUserIdAndCardSectionId(UUID userId, Long sectionId);

    /**
     * Find all progress for a user on a specific study card
     */
    List<UserCardProgress> findByUserIdAndStudyCardId(UUID userId, Long studyCardId);

    /**
     * Find all progress for a user
     */
    List<UserCardProgress> findByUserId(UUID userId);

    /**
     * Count completed sections for a user on a specific study card
     */
    @Query("SELECT COUNT(p) FROM UserCardProgress p WHERE p.user.id = :userId AND p.studyCard.id = :studyCardId AND p.completed = true")
    long countCompletedSectionsByUserAndCard(@Param("userId") UUID userId, @Param("studyCardId") Long studyCardId);

    /**
     * Check if user completed a specific section
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM UserCardProgress p WHERE p.user.id = :userId AND p.cardSection.id = :sectionId AND p.completed = true")
    boolean isSectionCompletedByUser(@Param("userId") UUID userId, @Param("sectionId") Long sectionId);

    /**
     * Delete progress for a specific user and section
     */
    void deleteByUserIdAndCardSectionId(UUID userId, Long sectionId);
}
