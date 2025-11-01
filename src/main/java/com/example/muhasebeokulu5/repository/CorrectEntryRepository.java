package com.example.muhasebeokulu5.repository;

import com.example.muhasebeokulu5.entities.CorrectEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CorrectEntryRepository extends JpaRepository<CorrectEntry, Long> {
    List<CorrectEntry> findByProblemId(Long problemId);
    void deleteByProblemId(Long problemId);
}
