package com.example.muhasebeokulu5.service;

import com.example.muhasebeokulu5.dto.UserAnswerDTO;
import com.example.muhasebeokulu5.entities.Problem;
import com.example.muhasebeokulu5.repository.ProblemRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AnswerService {

    private final ProblemRepository problemRepository;

    public AnswerService(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public Map<String, Object> checkAnswer(String problemId, UserAnswerDTO userAnswerDTO) {
        Long longId = Long.parseLong(problemId);
        Problem problem = problemRepository.findById(longId).orElseThrow();

        boolean correct = problem.getCorrectEntries().stream().anyMatch(entry ->
                entry.getAccountCode().equals(userAnswerDTO.getAccountCode()) &&
                        entry.getDebit() == userAnswerDTO.getDebit() &&
                        entry.getCredit() == userAnswerDTO.getCredit()
        );

        Map<String, Object> result = new HashMap<>();
        result.put("correct", correct);
        result.put("message", correct ? "Tebrikler, doğru kayıt!" : "Yanlış kayıt, tekrar deneyin.");
        result.put("pointsEarned", correct ? 10 : 0);
        return result;
    }
}
