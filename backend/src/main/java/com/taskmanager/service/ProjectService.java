package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public List<ProjectDTO> getMyProjects(Long userId) {
        return projectRepository.findAllByMemberId(userId)
                .stream().map(this::toDTO).toList();
    }

    public ProjectDTO getProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId))
            throw new RuntimeException("Access denied");
        return toDTO(project);
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO dto, User owner) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setOwner(owner);
        project.setStatus(Project.Status.ACTIVE);
        project = projectRepository.save(project);

        // Add owner as OWNER member
        ProjectMember member = new ProjectMember();
        member.getId().setProjectId(project.getId());
        member.getId().setUserId(owner.getId());
        member.setProject(project);
        member.setUser(owner);
        member.setRole(ProjectMember.Role.OWNER);
        projectMemberRepository.save(member);

        return toDTO(project);
    }

    @Transactional
    public ProjectDTO updateProject(Long projectId, ProjectDTO dto, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        assertOwnerOrAdmin(projectId, userId);

        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        if (dto.getStatus() != null)
            project.setStatus(Project.Status.valueOf(dto.getStatus()));

        return toDTO(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        assertOwnerOrAdmin(projectId, userId);
        projectRepository.deleteById(projectId);
    }

    @Transactional
    public void addMember(Long projectId, Long targetUserId, Long requesterId) {
        assertOwnerOrAdmin(projectId, requesterId);
        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, targetUserId))
            throw new RuntimeException("User is already a member");

        Project project = projectRepository.findById(projectId).orElseThrow();
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProjectMember member = new ProjectMember();
        member.getId().setProjectId(projectId);
        member.getId().setUserId(targetUserId);
        member.setProject(project);
        member.setUser(user);
        member.setRole(ProjectMember.Role.MEMBER);
        projectMemberRepository.save(member);
    }

    @Transactional
    public void removeMember(Long projectId, Long targetUserId, Long requesterId) {
        assertOwnerOrAdmin(projectId, requesterId);
        projectMemberRepository.deleteByProjectIdAndUserId(projectId, targetUserId);
    }

    private void assertOwnerOrAdmin(Long projectId, Long userId) {
        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        if (member.getRole() == ProjectMember.Role.MEMBER)
            throw new RuntimeException("Only owners and admins can do this");
    }

    public ProjectDTO toDTO(Project p) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setDescription(p.getDescription());
        dto.setStatus(p.getStatus().name());
        dto.setCreatedAt(p.getCreatedAt());

        if (p.getOwner() != null) {
            UserDTO ownerDTO = new UserDTO();
            ownerDTO.setId(p.getOwner().getId());
            ownerDTO.setUsername(p.getOwner().getUsername());
            ownerDTO.setFullName(p.getOwner().getFullName());
            ownerDTO.setAvatarColor(p.getOwner().getAvatarColor());
            dto.setOwner(ownerDTO);
        }

        if (p.getMembers() != null) {
            dto.setMembers(p.getMembers().stream().map(m -> {
                ProjectDTO.MemberDTO mdto = new ProjectDTO.MemberDTO();
                mdto.setId(m.getUser().getId());
                mdto.setUsername(m.getUser().getUsername());
                mdto.setFullName(m.getUser().getFullName());
                mdto.setAvatarColor(m.getUser().getAvatarColor());
                mdto.setRole(m.getRole().name());
                return mdto;
            }).toList());
        }

        if (p.getTasks() != null)
            dto.setTaskCount(p.getTasks().size());

        return dto;
    }
}