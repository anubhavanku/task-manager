package com.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WebSocketMessage {
    private String type;      // TASK_MOVED, TASK_CREATED, TASK_UPDATED, TASK_DELETED, COMMENT_ADDED
    private Object payload;   // The actual data (TaskDTO, CommentDTO, etc.)
    private String actor;     // username who did the action
    private Long projectId;
}