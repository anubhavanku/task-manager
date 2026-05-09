package com.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskActivityDTO {
    private Long id;
    private String action;
    private String oldValue;
    private String newValue;
    private UserDTO user;
    private LocalDateTime createdAt;
}