package com.taskmanager.dto;

import lombok.Data;

@Data
public class TaskMoveDTO {
    private String newStatus;
    private Integer newPosition;
}