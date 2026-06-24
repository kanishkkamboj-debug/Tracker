package com.example.Tracker.service;

import com.example.Tracker.dto.ProjectRequest;
import com.example.Tracker.dto.ProjectResponse;
import com.example.Tracker.dto.TaskResponse;
import com.example.Tracker.dto.MemberResponse;
import com.example.Tracker.entity.*;
import com.example.Tracker.exception.ResourceNotFoundException;
import com.example.Tracker.exception.UnauthorizedException;
import com.example.Tracker.repository.ProjectRepository;
import com.example.Tracker.repository.TaskRepository;
import com.example.Tracker.repository.UserRepository;
import com.example.Tracker.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public Page<ProjectResponse> getProjects(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return projectRepository.findByOwnerId(user.getId(), pageable)
                .map(this::toResponse);
    }

    public ProjectResponse createProject(User user, ProjectRequest request) {
        // Find or create a personal workspace for this user
        Workspace workspace = workspaceRepository.findByOwnerId(user.getId())
                .stream().findFirst()
                .orElseGet(() -> {
                    Workspace newWorkspace = Workspace.builder()
                            .name("Personal Workspace")
                            .ownerId(user.getId())
                            .build();
                    return workspaceRepository.save(newWorkspace);
                });

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.ACTIVE)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .githubRepoUrl(request.getGithubRepoUrl())
                .workspaceId(workspace.getId())
                .ownerId(user.getId())           // denormalized for dashboard queries
                .build();

        Project savedProject = projectRepository.save(project);
        return toResponse(savedProject);
    }

    public ProjectResponse getProject(User user, String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);
        return toResponse(project);
    }

    public ProjectResponse updateProject(User user, String projectId, ProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setGithubRepoUrl(request.getGithubRepoUrl());
        project.setUpdatedAt(LocalDateTime.now());

        return toResponse(projectRepository.save(project));
    }

    public void deleteProject(User user, String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);
        projectRepository.delete(project);
    }

    public void addMember(User user, String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);

        // Verify the target user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        boolean alreadyMember = project.getMembers().stream()
                .anyMatch(pm -> pm.getUserId().equals(userId));
        if (alreadyMember) return;

        project.getMembers().add(ProjectMember.builder()
                .userId(userId)
                .projectRole(ProjectMemberRole.MEMBER)
                .build());
        projectRepository.save(project);
    }

    public void removeMember(User user, String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);

        project.getMembers().removeIf(pm -> pm.getUserId().equals(userId));
        projectRepository.save(project);
    }

    public List<MemberResponse> getMembers(User user, String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        return project.getMembers().stream().map(pm -> {
            User u = userRepository.findById(pm.getUserId())
                    .orElse(null);
            if (u == null) return null;
            return MemberResponse.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .role(pm.getProjectRole().name())
                    .build();
        }).filter(java.util.Objects::nonNull).toList();
    }

    public List<TaskResponse> getProjectTasks(User user, String projectId) {
        if (!projectRepository.existsByIdAndOwnerId(projectId, user.getId())) {
            throw new ResourceNotFoundException("Project", projectId);
        }
        return taskRepository.findByProjectIdOrderByUpdatedAtDesc(projectId)
                .stream().map(this::taskToResponse).toList();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void assertOwner(User user, Project project) {
        if (!project.getOwnerId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this project");
        }
    }

    public ProjectResponse toResponse(Project project) {
        // Resolve owner name from userRepository (cached field would be ownerId)
        User owner = userRepository.findById(project.getOwnerId()).orElse(null);
        long taskCount = taskRepository.countByProjectId(project.getId());

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .ownerId(project.getOwnerId())
                .ownerName(owner != null ? owner.getName() : "")
                .taskCount((int) taskCount)
                .githubRepoUrl(project.getGithubRepoUrl())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public TaskResponse taskToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .assigneeName(resolveAssigneeName(task.getAssigneeId()))
                .projectId(task.getProjectId())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private String resolveAssigneeName(String assigneeId) {
        if (assigneeId == null) return null;
        return userRepository.findById(assigneeId).map(User::getName).orElse(null);
    }
}
