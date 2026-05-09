package com.taskmanager.controller;

import com.taskmanager.dto.ProjectDTO;
import com.taskmanager.model.User;
import com.taskmanager.service.ProjectService;
import com.taskmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getMyProjects(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(projectService.getMyProjects(user.getId()));
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(
            @RequestBody ProjectDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(projectService.createProject(dto, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(projectService.getProject(id, user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(projectService.updateProject(id, dto, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        projectService.deleteProject(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        projectService.addMember(id, body.get("userId"), user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User requester = userService.getUserFromEmail(userDetails.getUsername());
        projectService.removeMember(id, userId, requester.getId());
        return ResponseEntity.noContent().build();
    }
}