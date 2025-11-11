package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, UUID> {
    List<UserAnswer> findByUserId(UUID userId);
    List<UserAnswer> findByProblemId(Long problemId);

    // Room-related query methods have been archived

    /**
     * Belirli bir kullanıcının belirli bir problem için en son cevabını getir
     */
    @Query("SELECT ua FROM UserAnswer ua WHERE ua.user.id = :userId AND ua.problem.id = :problemId ORDER BY ua.answerTime DESC")
    List<UserAnswer> findByUserIdAndProblemIdOrderByAnswerTimeDesc(@Param("userId") UUID userId, @Param("problemId") Long problemId);

    /**
     * Bir kullanıcının denediği (en az bir cevap gönderdiği) farklı problem sayısını döndürür
     */
    @Query("SELECT COUNT(DISTINCT ua.problem.id) FROM UserAnswer ua WHERE ua.user.id = :userId")
    long countDistinctProblemsByUserId(@Param("userId") UUID userId);

    /**
     * Belirli bir kullanıcının belirli bir problem için kaç cevap gönderdiğini sayar
     * İlk deneme bonusu hesabı için kullanılır
     */
    @Query("SELECT COUNT(ua) FROM UserAnswer ua WHERE ua.user.id = :userId AND ua.problem.id = :problemId")
    long countByUserIdAndProblemId(@Param("userId") UUID userId, @Param("problemId") Long problemId);
}
