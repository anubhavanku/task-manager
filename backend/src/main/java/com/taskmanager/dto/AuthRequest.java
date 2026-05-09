package com.taskmanager.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String identifier; // email or username
    private String password;
}