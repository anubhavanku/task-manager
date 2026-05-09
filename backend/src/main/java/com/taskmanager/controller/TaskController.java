package com.taskmanager.controller;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.dto.TaskMoveDTO;
import com.taskmanager.model.User;
import com.taskmanager.service.TaskService;
import com.taskmanager.service.UserService;
import com.taskmanager.dto.TaskActivityDTO;
import com.taskmanager.repository.TaskActivityRepository;
import com.taskmanager.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;
    private final TaskActivityRepository activityRepository;

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<List<TaskDTO>> getProjectTasks(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, user.getId()));
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<TaskDTO> createTask(
            @PathVariable Long projectId,
            @RequestBody TaskDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.createTask(projectId, dto, user));
    }

    @GetMapping("/tasks/my-tasks")
    public ResponseEntity<List<TaskDTO>> getMyTasks(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.getMyTasks(user.getId()));
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<TaskDTO> getTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.getTask(id, user.getId()));
    }

    @GetMapping("/tasks/{id}/activity")
    public ResponseEntity<List<TaskActivityDTO>> getActivity(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        // verify access
        taskService.getTask(id, user.getId()); // throws if no access

        return ResponseEntity.ok(
                activityRepository.findByTaskIdOrderByCreatedAtDesc(id)
                        .stream().map(a -> {
                            TaskActivityDTO dto = new TaskActivityDTO();
                            dto.setId(a.getId());
                            dto.setAction(a.getAction());
                            dto.setOldValue(a.getOldValue());
                            dto.setNewValue(a.getNewValue());
                            dto.setCreatedAt(a.getCreatedAt());
                            if (a.getUser() != null) {
                                UserDTO u = new UserDTO();
                                u.setId(a.getUser().getId());
                                u.setUsername(a.getUser().getUsername());
                                u.setFullName(a.getUser().getFullName());
                                u.setAvatarColor(a.getUser().getAvatarColor());
                                dto.setUser(u);
                            }
                            return dto;
                        }).toList()
        );
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.updateTask(id, dto, user));
    }

    @PatchMapping("/tasks/{id}/move")
    public ResponseEntity<TaskDTO> moveTask(
            @PathVariable Long id,
            @RequestBody TaskMoveDTO moveDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(taskService.moveTask(id, moveDTO, user));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromEmail(userDetails.getUsername());
        taskService.deleteTask(id, user);
        return ResponseEntity.noContent().build();
    }
}