package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.entities.CorrectEntry;
import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.repository.CorrectEntryRepository;
import com.example.muhasebeokulu5.repository.ProblemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CorrectEntryService {

    private final CorrectEntryRepository correctEntryRepository;
    private final ProblemRepository problemRepository;

    public CorrectEntryService(CorrectEntryRepository correctEntryRepository, ProblemRepository problemRepository) {
        this.correctEntryRepository = correctEntryRepository;
        this.problemRepository = problemRepository;
    }

    public List<CorrectEntry> getEntriesByProblemId(Long problemId) {
        return correctEntryRepository.findByProblemId(problemId);
    }

    @Transactional
    public CorrectEntry save(CorrectEntry entry) {
        if (entry.getProblem() == null || entry.getProblem().getId() == null) {
            throw new IllegalArgumentException("Problem ID cannot be null while saving CorrectEntry.");
        }

        Problem problem = problemRepository.findById(entry.getProblem().getId())
                .orElseThrow(() -> new RuntimeException("Problem not found with id " + entry.getProblem().getId()));

        entry.setProblem(problem);
        return correctEntryRepository.save(entry);
    }
}
