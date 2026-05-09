package com.taskmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.MEMBER;

    private String avatarColor;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (avatarColor == null) {
            String[] colors = {"#F44336","#E91E63","#9C27B0","#3F51B5","#2196F3","#009688","#FF5722"};
            avatarColor = colors[(int)(Math.random() * colors.length)];
        }
    }

    public enum Role {
        ADMIN, MEMBER
    }
}