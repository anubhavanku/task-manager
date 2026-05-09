package com.taskmanager.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_members")
@Data
public class ProjectMember {

    @EmbeddedId
    private ProjectMemberId id = new ProjectMemberId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("projectId")
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role = Role.MEMBER;

    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }

    public enum Role {
        OWNER, ADMIN, MEMBER
    }

    @Embeddable
    @Data
    public static class ProjectMemberId implements java.io.Serializable {
        private Long projectId;
        private Long userId;
    }
}