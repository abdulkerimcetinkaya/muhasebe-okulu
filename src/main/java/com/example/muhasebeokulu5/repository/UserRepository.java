package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.Role;
import com.example.muhasebeokulu5.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :weekAgo")
    Long countUsersCreatedAfter(@Param("weekAgo") LocalDateTime weekAgo);
    
    // Admin panel için ek metodlar
    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String username, String email, Pageable pageable);
    
    Page<User> findByRole(Role role, Pageable pageable);
    
    @Query("SELECT u.username, u.firstName, u.lastName, u.totalScore, u.solvedCount, u.lastActiveDate " +
           "FROM User u ORDER BY u.totalScore DESC")
    List<Object[]> findTopUsersByScore();
    
    
    Long countByCreatedAtAfter(LocalDateTime date);
    
    @Query("SELECT COUNT(DISTINCT sp.user) FROM SolvedProblem sp WHERE sp.solvedAt >= :weekAgo")
    Long countDistinctUsersByRecentSolutions(@Param("weekAgo") LocalDateTime weekAgo);

    @Query("SELECT DATE(u.createdAt) as date, COUNT(u) as count " +
           "FROM User u WHERE u.createdAt >= :weekAgo " +
           "GROUP BY DATE(u.createdAt) ORDER BY date")
    List<Object[]> findDailyNewUsers(@Param("weekAgo") LocalDateTime weekAgo);
}
