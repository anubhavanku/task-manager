package com.taskmanager.controller;

import com.taskmanager.dto.CommentDTO;
import com.taskmanager.model.User;
import com.taskmanager.service.CommentService;
import com.taskmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    @GetMapping("/tasks/{taskId}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(commentService.getComments(taskId, user.getId()));
    }

    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<CommentDTO> addComment(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(commentService.addComment(taskId, body.get("content"), user));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        commentService.deleteComment(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}