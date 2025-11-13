package com.example.muhasebeokulu5.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tracks user performance per problem category.
 * Used for adaptive learning: identifies weak areas and recommends targeted problems.
 *
 * Example categories: "Kasa İşlemleri", "Banka İşlemleri", "Alacak-Borç İşlemleri", etc.
 * Categories are created dynamically by admin when adding problems.
 */
@Entity
@Table(name = "user_category_performance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "category"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCategoryPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String category;  // Problem category name

    @Builder.Default
    @Column(name = "total_attempts", nullable = false)
    private Integer totalAttempts = 0;  // Total problems attempted in this category

    @Builder.Default
    @Column(name = "success_count", nullable = false)
    private Integer successCount = 0;  // Problems solved correctly in this category

    @Builder.Default
    @Column(name = "success_rate", nullable = false)
    private Double successRate = 0.0;  // Success percentage (0-100)

    @Builder.Default
    @Column(name = "average_attempts", nullable = false)
    private Double averageAttempts = 0.0;  // Average attempts needed to solve problems

    @Builder.Default
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated = LocalDateTime.now();

    /**
     * Updates performance metrics after a problem attempt.
     *
     * @param isSuccess Whether the problem was solved correctly
     * @param attemptCount Number of attempts for this problem
     */
    public void updatePerformance(boolean isSuccess, int attemptCount) {
        this.totalAttempts++;

        if (isSuccess) {
            this.successCount++;
        }

        // Recalculate success rate
        this.successRate = (this.successCount * 100.0) / this.totalAttempts;

        // Update average attempts (weighted average)
        this.averageAttempts = ((this.averageAttempts * (this.totalAttempts - 1)) + attemptCount)
                                / this.totalAttempts;

        this.lastUpdated = LocalDateTime.now();
    }

    /**
     * Determines if this category is a weak area for the user.
     * Weak area = success rate < 60% OR average attempts > 2.5
     *
     * @return true if this is a weak category
     */
    public boolean isWeakArea() {
        return successRate < 60.0 || averageAttempts > 2.5;
    }

    /**
     * Determines if this category is a strong area for the user.
     * Strong area = success rate > 80% AND average attempts < 1.8
     *
     * @return true if this is a strong category
     */
    public boolean isStrongArea() {
        return successRate > 80.0 && averageAttempts < 1.8;
    }
}
