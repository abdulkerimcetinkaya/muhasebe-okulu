package com.example.muhasebeokulu5.controller;

import com.example.muhasebeokulu5.entities.Comment;
import com.example.muhasebeokulu5.service.CommentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;
    public CommentController(CommentService commentService) { this.commentService = commentService; }

    @GetMapping("/post/{postId}")
    public List<Comment> getByPost(@PathVariable UUID postId) {
        return commentService.getCommentsByPostId(postId);
    }

    @PostMapping
    public Comment createComment(@RequestBody Comment comment) {
        return commentService.save(comment);
    }
}
