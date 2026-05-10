package com.taskmanager.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private Integer position;
    private Long projectId;
    private Long assigneeId;
    private UserDTO assignee;
    private UserDTO createdBy;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}