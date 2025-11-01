package com.example.muhasebeokulu5.service;



import com.example.muhasebeokulu5.entities.UserAnswer;
import com.example.muhasebeokulu5.repository.UserAnswerRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class UserAnswerService {

    private final UserAnswerRepository userAnswerRepository;

    public UserAnswerService(UserAnswerRepository userAnswerRepository) {
        this.userAnswerRepository = userAnswerRepository;
    }

    public List<UserAnswer> getAnswersByUserId(UUID userId) {
        return userAnswerRepository.findByUserId(userId);
    }

    public List<UserAnswer> getAnswersByProblemId(Long problemId) {
        return userAnswerRepository.findByProblemId(problemId);
    }

    public UserAnswer save(UserAnswer answer) {
        return userAnswerRepository.save(answer);
    }
}
