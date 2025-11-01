package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.entities.DiscussionPost;
import com.example.muhasebeokulu5.service.DiscussionPostService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class DiscussionPostController {

    private final DiscussionPostService discussionPostService;
    public DiscussionPostController(DiscussionPostService discussionPostService) {
        this.discussionPostService = discussionPostService;
    }

    @GetMapping("/problem/{problemId}")
    public List<DiscussionPost> getPostsByProblem(@PathVariable Long problemId) {
        return discussionPostService.getPostsByProblemId(problemId);
    }

    @PostMapping
    public DiscussionPost createPost(@RequestBody DiscussionPost post) {
        return discussionPostService.save(post);
    }
}
