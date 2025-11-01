package com.example.muhasebeokulu5.service;


import com.example.muhasebeokulu5.entities.Comment;
import com.example.muhasebeokulu5.repository.CommentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public List<Comment> getCommentsByPostId(UUID postId) {
        return commentRepository.findByPostId(postId);
    }

    public Comment save(Comment comment) {
        return commentRepository.save(comment);
    }
}
