package com.example.muhasebeokulu5.repository;



import com.example.muhasebeokulu5.entities.Difficulty;
import com.example.muhasebeokulu5.entities.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {
    Long countByDifficulty(Difficulty difficulty);
    
    // EntityGraph ile solvedProblems ilişkisini yükle
    @EntityGraph(attributePaths = {"solvedProblems", "solvedProblems.user"})
    @Query("SELECT p FROM Problem p")
    Page<Problem> findAllWithSolvedProblems(Pageable pageable);

    @EntityGraph(attributePaths = {"solvedProblems", "solvedProblems.user"})
    @Query("SELECT p FROM Problem p WHERE p.difficulty = :difficulty")
    Page<Problem> findByDifficultyWithSolvedProblems(@Param("difficulty") Difficulty difficulty, Pageable pageable);

    @EntityGraph(attributePaths = {"solvedProblems", "solvedProblems.user"})
    @Query("SELECT p FROM Problem p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Problem> searchProblemsWithSolvedProblems(@Param("search") String search, Pageable pageable);

    @EntityGraph(attributePaths = {"solvedProblems", "solvedProblems.user"})
    @Query("SELECT p FROM Problem p WHERE " +
           "p.difficulty = :difficulty AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Problem> searchProblemsByDifficultyWithSolvedProblems(@Param("search") String search,
                                                               @Param("difficulty") Difficulty difficulty,
                                                               Pageable pageable);
    
    // Zorluk seviyesine göre filtrele
    Page<Problem> findByDifficulty(Difficulty difficulty, Pageable pageable);
    
    // Arama (başlık, içerik veya etiketlerde)
    @Query("SELECT p FROM Problem p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Problem> searchProblems(@Param("search") String search, Pageable pageable);
    
    // Arama + Zorluk
    @Query("SELECT p FROM Problem p WHERE " +
           "p.difficulty = :difficulty AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Problem> searchProblemsByDifficulty(@Param("search") String search, 
                                              @Param("difficulty") Difficulty difficulty, 
                                              Pageable pageable);

    // Status filtreleme - Çözülmüş problemler (belirli kullanıcı için)
    @Query("SELECT DISTINCT p FROM Problem p " +
           "JOIN p.solvedProblems sp " +
           "WHERE sp.user.id = :userId")
    Page<Problem> findSolvedProblemsByUser(@Param("userId") UUID userId, Pageable pageable);

    // Status filtreleme - Çözülmemiş problemler (belirli kullanıcı için)
    @Query("SELECT p FROM Problem p " +
           "WHERE p.id NOT IN (" +
           "SELECT sp.problem.id FROM SolvedProblem sp WHERE sp.user.id = :userId)")
    Page<Problem> findUnsolvedProblemsByUser(@Param("userId") UUID userId, Pageable pageable);

    // Status + Zorluk - Çözülmüş problemler
    @Query("SELECT DISTINCT p FROM Problem p " +
           "JOIN p.solvedProblems sp " +
           "WHERE sp.user.id = :userId AND p.difficulty = :difficulty")
    Page<Problem> findSolvedProblemsByUserAndDifficulty(@Param("userId") UUID userId,
                                                        @Param("difficulty") Difficulty difficulty,
                                                        Pageable pageable);

    // Status + Zorluk - Çözülmemiş problemler
    @Query("SELECT p FROM Problem p " +
           "WHERE p.difficulty = :difficulty AND p.id NOT IN (" +
           "SELECT sp.problem.id FROM SolvedProblem sp WHERE sp.user.id = :userId)")
    Page<Problem> findUnsolvedProblemsByUserAndDifficulty(@Param("userId") UUID userId,
                                                          @Param("difficulty") Difficulty difficulty,
                                                          Pageable pageable);
    
    // Status + Arama - Çözülmüş problemler
    @Query("SELECT DISTINCT p FROM Problem p " +
           "JOIN p.solvedProblems sp " +
           "WHERE sp.user.id = :userId AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Problem> findSolvedProblemsByUserAndSearch(@Param("userId") UUID userId,
                                                    @Param("search") String search,
                                                    Pageable pageable);

    // Status + Arama - Çözülmemiş problemler
    @Query("SELECT p FROM Problem p " +
           "WHERE p.id NOT IN (" +
           "SELECT sp.problem.id FROM SolvedProblem sp WHERE sp.user.id = :userId) AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Problem> findUnsolvedProblemsByUserAndSearch(@Param("userId") UUID userId,
                                                      @Param("search") String search,
                                                      Pageable pageable);

    // Status + Arama + Zorluk - Çözülmüş problemler
    @Query("SELECT DISTINCT p FROM Problem p " +
           "JOIN p.solvedProblems sp " +
           "WHERE sp.user.id = :userId AND p.difficulty = :difficulty AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Problem> findSolvedProblemsByUserAndDifficultyAndSearch(@Param("userId") UUID userId,
                                                                 @Param("difficulty") Difficulty difficulty,
                                                                 @Param("search") String search,
                                                                 Pageable pageable);

    // Status + Arama + Zorluk - Çözülmemiş problemler
    @Query("SELECT p FROM Problem p " +
           "WHERE p.difficulty = :difficulty AND p.id NOT IN (" +
           "SELECT sp.problem.id FROM SolvedProblem sp WHERE sp.user.id = :userId) AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Problem> findUnsolvedProblemsByUserAndDifficultyAndSearch(@Param("userId") UUID userId,
                                                                  @Param("difficulty") Difficulty difficulty,
                                                                  @Param("search") String search,
                                                                  Pageable pageable);

    // ===  Öğretmen için sorgular ===

    // Öğretmenin oluşturduğu tüm problemler
    List<Problem> findByCreatedByOrderByCreatedAtDesc(java.util.UUID createdBy);

    // Room-specific isPrivate methods have been archived

    // Tüm problemleri getir
    @Query("SELECT p FROM Problem p")
    Page<Problem> findPublicProblems(Pageable pageable);

    // Sayfalı - öğretmenin problemleri
    Page<Problem> findByCreatedByOrderByCreatedAtDesc(java.util.UUID createdBy, Pageable pageable);


}
