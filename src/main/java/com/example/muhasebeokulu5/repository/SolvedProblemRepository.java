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

    // Admin panel için ek metodlar
    @Query("SELECT COUNT(sp) FROM SolvedProblem sp WHERE sp.problem.id = :problemId")
    Long countByProblemId(@Param("problemId") Long problemId);
}
