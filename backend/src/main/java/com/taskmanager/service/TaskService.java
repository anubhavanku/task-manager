package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskActivityRepository activityRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final WebSocketService webSocketService;          // ← ADDED

    public List<TaskDTO> getTasksByProject(Long projectId, Long userId) {
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId))
            throw new RuntimeException("Access denied");
        return taskRepository.findByProjectIdOrderByStatusAscPositionAsc(projectId)
                .stream().map(this::toDTO).toList();
    }

    public List<TaskDTO> getMyTasks(Long userId) {
        return taskRepository.findByAssigneeIdOrderByDueDateAsc(userId)
                .stream().map(this::toDTO).toList();
    }

    public TaskDTO getTask(Long taskId, Long userId) {
        Task task = getTaskAndVerifyAccess(taskId, userId);
        return toDTO(task);
    }

    @Transactional
    public TaskDTO createTask(Long projectId, TaskDTO dto, User creator) {
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, creator.getId()))
            throw new RuntimeException("Access denied");

        Project project = projectRepository.findById(projectId).orElseThrow();

        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority() != null ?
                Task.Priority.valueOf(dto.getPriority()) : Task.Priority.MEDIUM);
        task.setDueDate(dto.getDueDate());
        task.setProject(project);
        task.setCreatedBy(creator);
        task.setStatus(Task.Status.TODO);
        task.setPosition(0);

        if (dto.getAssigneeId() != null) {
            userRepository.findById(dto.getAssigneeId())
                    .ifPresent(task::setAssignee);
        } else if (dto.getAssignee() != null && dto.getAssignee().getId() != null) {
            userRepository.findById(dto.getAssignee().getId())
                    .ifPresent(task::setAssignee);
        }

        task = taskRepository.save(task);
        logActivity(task, creator, "created task", null, task.getTitle());

        TaskDTO taskDTO = toDTO(task);                                                          // ← CHANGED
        webSocketService.sendToProject(projectId, "TASK_CREATED", taskDTO, creator.getUsername()); // ← ADDED
        return taskDTO;                                                                         // ← CHANGED
    }

    @Transactional
    public TaskDTO updateTask(Long taskId, TaskDTO dto, User updater) {
        Task task = getTaskAndVerifyAccess(taskId, updater.getId());

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        if (dto.getPriority() != null)
            task.setPriority(Task.Priority.valueOf(dto.getPriority()));
        task.setDueDate(dto.getDueDate());

        if (dto.getAssigneeId() != null) {
            userRepository.findById(dto.getAssigneeId())
                    .ifPresent(task::setAssignee);
        } else if (dto.getAssignee() != null && dto.getAssignee().getId() != null) {
            userRepository.findById(dto.getAssignee().getId())
                    .ifPresent(task::setAssignee);
        } else {
            task.setAssignee(null);
        }

        logActivity(task, updater, "updated task", null, null);

        TaskDTO taskDTO = toDTO(taskRepository.save(task));                                          // ← CHANGED
        webSocketService.sendToProject(taskDTO.getProjectId(), "TASK_UPDATED", taskDTO, updater.getUsername()); // ← ADDED
        return taskDTO;                                                                              // ← CHANGED
    }

    @Transactional
    public TaskDTO moveTask(Long taskId, TaskMoveDTO moveDTO, User mover) {
        Task task = getTaskAndVerifyAccess(taskId, mover.getId());

        String oldStatus = task.getStatus().name();
        task.setStatus(Task.Status.valueOf(moveDTO.getNewStatus()));
        if (moveDTO.getNewPosition() != null)
            task.setPosition(moveDTO.getNewPosition());

        logActivity(task, mover, "moved task", oldStatus, moveDTO.getNewStatus());

        TaskDTO taskDTO = toDTO(taskRepository.save(task));                                        // ← CHANGED
        webSocketService.sendToProject(taskDTO.getProjectId(), "TASK_MOVED", taskDTO, mover.getUsername()); // ← ADDED
        return taskDTO;                                                                            // ← CHANGED
    }

    @Transactional
    public void deleteTask(Long taskId, User deleter) {
        Task task = getTaskAndVerifyAccess(taskId, deleter.getId());

        Long projectId = task.getProject().getId();                                                // ← ADDED
        String title = task.getTitle();                                                            // ← ADDED
        taskRepository.delete(task);
        webSocketService.sendToProject(                                                            // ← ADDED
                projectId, "TASK_DELETED",
                Map.of("taskId", taskId, "title", title),
                deleter.getUsername());
    }

    private Task getTaskAndVerifyAccess(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        if (!projectMemberRepository.existsByProjectIdAndUserId(
                task.getProject().getId(), userId))
            throw new RuntimeException("Access denied");
        return task;
    }

    private void logActivity(Task task, User user, String action,
                             String oldVal, String newVal) {
        TaskActivity activity = new TaskActivity();
        activity.setTask(task);
        activity.setUser(user);
        activity.setAction(action);
        activity.setOldValue(oldVal);
        activity.setNewValue(newVal);
        activityRepository.save(activity);
    }

    public TaskDTO toDTO(Task t) {
        TaskDTO dto = new TaskDTO();
        dto.setId(t.getId());
        dto.setTitle(t.getTitle());
        dto.setDescription(t.getDescription());
        dto.setStatus(t.getStatus().name());
        dto.setPriority(t.getPriority().name());
        dto.setDueDate(t.getDueDate());
        dto.setPosition(t.getPosition());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());

        if (t.getProject() != null)
            dto.setProjectId(t.getProject().getId());

        if (t.getAssignee() != null) {
            UserDTO u = new UserDTO();
            u.setId(t.getAssignee().getId());
            u.setUsername(t.getAssignee().getUsername());
            u.setFullName(t.getAssignee().getFullName());
            u.setAvatarColor(t.getAssignee().getAvatarColor());
            dto.setAssignee(u);
        }

        if (t.getCreatedBy() != null) {
            UserDTO u = new UserDTO();
            u.setId(t.getCreatedBy().getId());
            u.setUsername(t.getCreatedBy().getUsername());
            u.setFullName(t.getCreatedBy().getFullName());
            u.setAvatarColor(t.getCreatedBy().getAvatarColor());
            dto.setCreatedBy(u);
        }

        if (t.getComments() != null)
            dto.setCommentCount(t.getComments().size());

        return dto;
    }
}