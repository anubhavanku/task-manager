package com.taskmanager.controller;

import com.taskmanager.dto.TaskMoveDTO;
import com.taskmanager.dto.TaskDTO;
import com.taskmanager.model.User;
import com.taskmanager.service.TaskService;
import com.taskmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final TaskService taskService;
    private final UserService userService;

    // Client sends to /app/task.move
    // Broadcasts to /topic/project/{projectId}
    @MessageMapping("/task.move")
    public void moveTask(@Payload TaskMoveDTO moveDTO,
                         @Header("taskId") Long taskId,
                         Authentication authentication) {
        User user = userService.getUserFromEmail(authentication.getName());
        taskService.moveTask(taskId, moveDTO, user);
        // WebSocketService inside moveTask handles the broadcast
    }
}