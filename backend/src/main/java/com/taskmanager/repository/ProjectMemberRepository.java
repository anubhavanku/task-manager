package com.taskmanager.repository;

import com.taskmanager.model.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, ProjectMember.ProjectMemberId> {
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
}