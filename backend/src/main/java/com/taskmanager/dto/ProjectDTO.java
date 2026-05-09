package com.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private UserDTO owner;
    private List<MemberDTO> members;
    private int taskCount;
    private LocalDateTime createdAt;

    @Data
    public static class MemberDTO {
        private Long id;
        private String username;
        private String fullName;
        private String avatarColor;
        private String role;
    }
}