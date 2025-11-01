package com.example.muhasebeokulu5.service;



import com.example.muhasebeokulu5.entities.DiscussionPost;
import com.example.muhasebeokulu5.repository.DiscussionPostRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class DiscussionPostService {

    private final DiscussionPostRepository discussionPostRepository;

    public DiscussionPostService(DiscussionPostRepository discussionPostRepository) {
        this.discussionPostRepository = discussionPostRepository;
    }

    public List<DiscussionPost> getPostsByProblemId(Long problemId) {
        return discussionPostRepository.findByProblemId(problemId);
    }

    public DiscussionPost save(DiscussionPost post) {
        return discussionPostRepository.save(post);
    }
}
