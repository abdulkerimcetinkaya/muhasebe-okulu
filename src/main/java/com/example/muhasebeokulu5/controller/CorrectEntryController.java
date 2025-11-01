package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.entities.CorrectEntry;
import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.repository.CorrectEntryRepository;
import com.example.muhasebeokulu5.repository.ProblemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:63342")
@RestController
@RequestMapping("/api/correct-entries")
public class CorrectEntryController {

    private final CorrectEntryRepository correctEntryRepository;
    private final ProblemRepository problemRepository;

    public CorrectEntryController(CorrectEntryRepository correctEntryRepository, ProblemRepository problemRepository) {
        this.correctEntryRepository = correctEntryRepository;
        this.problemRepository = problemRepository;
    }

    @GetMapping("/{problemId}")
    public List<CorrectEntry> getByProblem(@PathVariable Long problemId) {
        return correctEntryRepository.findByProblemId(problemId);
    }

    @PostMapping("/{problemId}")
    public ResponseEntity<?> addCorrectEntries(@PathVariable Long problemId, @RequestBody List<CorrectEntry> entries) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        for (CorrectEntry e : entries) {
            e.setProblem(problem);
        }
        correctEntryRepository.saveAll(entries);
        return ResponseEntity.ok("Correct entries added");
    }

    @PutMapping("/{problemId}")
    @Transactional
    public ResponseEntity<?> updateCorrectEntries(@PathVariable Long problemId, @RequestBody List<CorrectEntry> entries) {
        // Önce mevcut kayıtları sil
        correctEntryRepository.deleteByProblemId(problemId);
        
        // Yeni kayıtları ekle
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Problem not found"));
        for (CorrectEntry e : entries) {
            e.setProblem(problem);
        }
        correctEntryRepository.saveAll(entries);
        return ResponseEntity.ok("Correct entries updated");
    }

    @DeleteMapping("/{problemId}")
    public ResponseEntity<?> deleteAllByProblem(@PathVariable Long problemId) {
        correctEntryRepository.deleteByProblemId(problemId);
        return ResponseEntity.ok("All correct entries deleted for problem " + problemId);
    }
}
