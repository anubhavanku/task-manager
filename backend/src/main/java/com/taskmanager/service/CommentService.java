package com.taskmanager.service;

import com.taskmanager.dto.CommentDTO;
import com.taskmanager.dto.UserDTO;
import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public List<CommentDTO> getComments(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (!projectMemberRepository.existsByProjectIdAndUserId(
                task.getProject().getId(), userId))
            throw new RuntimeException("Access denied");
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public CommentDTO addComment(Long taskId, String content, User author) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (!projectMemberRepository.existsByProjectIdAndUserId(
                task.getProject().getId(), author.getId()))
            throw new RuntimeException("Access denied");

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setTask(task);
        comment.setAuthor(author);
        return toDTO(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getAuthor().getId().equals(userId))
            throw new RuntimeException("Can only delete your own comments");
        commentRepository.delete(comment);
    }

    public CommentDTO toDTO(Comment c) {
        CommentDTO dto = new CommentDTO();
        dto.setId(c.getId());
        dto.setContent(c.getContent());
        dto.setCreatedAt(c.getCreatedAt());
        UserDTO u = new UserDTO();
        u.setId(c.getAuthor().getId());
        u.setUsername(c.getAuthor().getUsername());
        u.setFullName(c.getAuthor().getFullName());
        u.setAvatarColor(c.getAuthor().getAvatarColor());
        dto.setAuthor(u);
        return dto;
    }
}