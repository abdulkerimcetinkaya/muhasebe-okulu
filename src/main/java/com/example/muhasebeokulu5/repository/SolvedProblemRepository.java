package com.example.muhasebeokulu5.repository;



import com.example.muhasebeokulu5.entities.SolvedProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Repository
public interface SolvedProblemRepository extends JpaRepository<SolvedProblem, UUID> {
    List<SolvedProblem> findByUserId(UUID userId);
    List<SolvedProblem> findByProblemId(Long problemId);
    boolean existsByUserIdAndProblemId(UUID userId, Long problemId);
    // Yeni: Aktif kullanıcı sayısı (son 7 gün içinde çözüm yapan)
    @Query("SELECT COUNT(DISTINCT sp.user.id) FROM SolvedProblem sp WHERE sp.solvedAt >= :weekAgo")
    Long countActiveUsers(@Param("weekAgo") LocalDateTime weekAgo);

    // Yeni: Bu hafta çözülen problem sayısı
    @Query("SELECT COUNT(sp) FROM SolvedProblem sp WHERE sp.solvedAt >= :weekAgo")
    Long countSolutionsAfter(@Param("weekAgo") LocalDateTime weekAgo);

    // Yeni: En çok çözülen problemler
    @Query("SELECT sp.problem.id, sp.problem.title, sp.problem.difficulty, COUNT(sp) as solveCount " +
            "FROM SolvedProblem sp " +
            "GROUP BY sp.problem.id, sp.problem.title, sp.problem.difficulty " +
            "ORDER BY solveCount DESC")
    List<Object[]> findTopSolvedProblems();

    // Yeni: Günlük çözüm sayıları (son 7 gün)
    @Query("SELECT CAST(sp.solvedAt AS date), COUNT(sp) " +
            "FROM SolvedProblem sp " +
            "WHERE sp.solvedAt >= :weekAgo " +
            "GROUP BY CAST(sp.solvedAt AS date) " +
            "ORDER BY CAST(sp.solvedAt AS date) ASC")
    List<Object[]> findDailySolutions(@Param("weekAgo") LocalDateTime weekAgo);

    // Kullanıcıya özel günlük çözüm sayıları (son 7 gün)
    @Query("SELECT CAST(sp.solvedAt AS date), COUNT(sp) " +
            "FROM SolvedProblem sp " +
            "WHERE sp.user.id = :userId AND sp.solvedAt >= :weekAgo " +
            "GROUP BY CAST(sp.solvedAt AS date) " +
            "ORDER BY CAST(sp.solvedAt AS date) ASC")
    List<Object[]> findDailySolutionsByUser(@Param("userId") UUID userId, @Param("weekAgo") LocalDateTime weekAgo);

    // En aktif kullanıcılar (en çok çözüm yapan)
    @Query("SELECT sp.user.username, COUNT(sp) as solutionCount " +
            "FROM SolvedProblem sp " +
            "GROUP BY sp.user.id, sp.user.username " +
            "ORDER BY solutionCount DESC")
    List<Object[]> findTopActiveUsers();

    // Admin panel için ek metodlar
    @Query("SELECT COUNT(sp) FROM SolvedProblem sp WHERE sp.problem.id = :problemId")
    Long countByProblemId(@Param("problemId") Long problemId);

    // Kullanıcının çözdüğü problem sayısı
    @Query("SELECT COUNT(sp) FROM SolvedProblem sp WHERE sp.user.id = :userId")
    Long countByUserId(@Param("userId") UUID userId);

    // Zorluk seviyesine göre istatistik metodları
    @Query("SELECT COUNT(sp) FROM SolvedProblem sp WHERE sp.user.id = :userId AND sp.problem.difficulty = :difficulty")
    Long countByUserIdAndProblemDifficulty(@Param("userId") UUID userId, @Param("difficulty") com.example.muhasebeokulu5.entities.Difficulty difficulty);

    @Query("SELECT COUNT(sp) FROM SolvedProblem sp WHERE sp.user.id = :userId AND sp.solvedAt >= :afterDate")
    Long countByUserIdAndSolvedDateAfter(@Param("userId") UUID userId, @Param("afterDate") LocalDateTime afterDate);

    // ============================================
    // 🎯 LEVEL SYSTEM QUERIES
    // ============================================

    /**
     * Find all problems solved by user at a specific level.
     * Used for level progression calculations.
     */
    @Query("SELECT sp FROM SolvedProblem sp WHERE sp.user = :user AND sp.problem.level = :level ORDER BY sp.solvedAt DESC")
    List<SolvedProblem> findByUserAndProblem_Level(@Param("user") com.example.muhasebeokulu5.entities.User user, @Param("level") Integer level);

    /**
     * Find last N solved problems by user.
     * Used for adaptive learning (analyzing recent performance).
     */
    @Query("SELECT sp FROM SolvedProblem sp WHERE sp.user = :user ORDER BY sp.solvedAt DESC")
    List<SolvedProblem> findLastNByUser(@Param("user") com.example.muhasebeokulu5.entities.User user, org.springframework.data.domain.Pageable pageable);

    /**
     * Find all solved problems by user in a specific category.
     * Used for category performance tracking.
     */
    @Query("SELECT sp FROM SolvedProblem sp WHERE sp.user = :user AND sp.problem.category = :category ORDER BY sp.solvedAt DESC")
    List<SolvedProblem> findByUserAndProblem_Category(@Param("user") com.example.muhasebeokulu5.entities.User user, @Param("category") String category);

    /**
     * Count problems solved by user at a specific level.
     */
    @Query("SELECT COUNT(sp) FROM SolvedProblem sp WHERE sp.user.id = :userId AND sp.problem.level = :level")
    Long countByUserIdAndProblemLevel(@Param("userId") UUID userId, @Param("level") Integer level);
}
