// src/main/java/com/example/muhasebeokulu5/repository/AccountPlanRepository.java
package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.AccountPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountPlanRepository extends JpaRepository<AccountPlan, Long> {

    Optional<AccountPlan> findByCode(String code);

    @Query("SELECT a FROM AccountPlan a WHERE a.code LIKE :code% AND a.active = true")
    List<AccountPlan> findByCodeStartingWith(@Param("code") String code);

    @Query("SELECT a FROM AccountPlan a WHERE a.active = true ORDER BY a.code")
    List<AccountPlan> findAllActive();
}