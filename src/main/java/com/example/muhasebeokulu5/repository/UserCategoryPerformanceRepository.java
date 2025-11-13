package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.User;
import com.example.muhasebeokulu5.entities.UserCategoryPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCategoryPerformanceRepository extends JpaRepository<UserCategoryPerformance, Long> {

    /**
     * Find performance record for a specific user and category.
     */
    Optional<UserCategoryPerformance> findByUserAndCategory(User user, String category);

    /**
     * Find all performance records for a user.
     */
    List<UserCategoryPerformance> findByUser(User user);

    /**
     * Find all performance records for a user, ordered by success rate (ascending).
     * Useful for identifying weak areas.
     */
    List<UserCategoryPerformance> findByUserOrderBySuccessRateAsc(User user);

    /**
     * Find weak areas for a user (success rate < 60%).
     */
    @Query("SELECT ucp FROM UserCategoryPerformance ucp WHERE ucp.user = :user AND ucp.successRate < 60.0 ORDER BY ucp.successRate ASC")
    List<UserCategoryPerformance> findWeakAreasByUser(@Param("user") User user);

    /**
     * Find strong areas for a user (success rate > 80% AND average attempts < 1.8).
     */
    @Query("SELECT ucp FROM UserCategoryPerformance ucp WHERE ucp.user = :user AND ucp.successRate > 80.0 AND ucp.averageAttempts < 1.8 ORDER BY ucp.successRate DESC")
    List<UserCategoryPerformance> findStrongAreasByUser(@Param("user") User user);

    /**
     * Find user's performance in a specific category by user ID.
     */
    @Query("SELECT ucp FROM UserCategoryPerformance ucp WHERE ucp.user.id = :userId AND ucp.category = :category")
    Optional<UserCategoryPerformance> findByUserIdAndCategory(@Param("userId") UUID userId, @Param("category") String category);

    /**
     * Get all unique categories tracked in the system.
     */
    @Query("SELECT DISTINCT ucp.category FROM UserCategoryPerformance ucp ORDER BY ucp.category")
    List<String> findAllUniqueCategories();
}
