package com.example.Tracker.service;

import com.example.Tracker.dto.ProjectRequest;
import com.example.Tracker.dto.ProjectResponse;
import com.example.Tracker.dto.TaskResponse;
import com.example.Tracker.entity.Project;
import com.example.Tracker.entity.ProjectStatus;
import com.example.Tracker.entity.Task;
import com.example.Tracker.entity.User;
import com.example.Tracker.entity.Workspace;
import com.example.Tracker.entity.ProjectMember;
import com.example.Tracker.entity.ProjectMemberRole;
import com.example.Tracker.dto.MemberResponse;
import com.example.Tracker.exception.ResourceNotFoundException;
import com.example.Tracker.exception.UnauthorizedException;
import com.example.Tracker.repository.ProjectRepository;
import com.example.Tracker.repository.TaskRepository;
import com.example.Tracker.repository.WorkspaceRepository;
import com.example.Tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getProjects(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return projectRepository.findByWorkspaceOwnerId(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ProjectResponse createProject(User user, ProjectRequest request) {
        Workspace workspace = workspaceRepository.findByOwnerId(user.getId())
                .stream().findFirst()
                .orElseGet(() -> {
                    Workspace newWorkspace = Workspace.builder()
                            .name("Personal Workspace")
                            .owner(user)
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
                .workspace(workspace)
                .build();

        @SuppressWarnings("null")
        Project savedProject = projectRepository.save(project);
        return toResponse(savedProject);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(User user, Long projectId) {
        Project project = projectRepository.findWithWorkspaceById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);
        return toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(User user, Long projectId, ProjectRequest request) {
        Project project = projectRepository.findWithWorkspaceById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setGithubRepoUrl(request.getGithubRepoUrl());
        project.setUpdatedAt(LocalDateTime.now());

        @SuppressWarnings("null")
        Project savedProject = projectRepository.save(project);
        return toResponse(savedProject);
    }

    @Transactional
    public void deleteProject(User user, Long projectId) {
        Project project = projectRepository.findWithWorkspaceById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);
        projectRepository.delete(project);
    }

    @Transactional
    public void addMember(User user, Long projectId, Long userId) {
        Project project = projectRepository.findWithWorkspaceById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);

        User memberToAdd = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        boolean alreadyMember = project.getMembers().stream()
                .anyMatch(pm -> pm.getUser().getId().equals(userId));
        if (alreadyMember) return;

        ProjectMember pm = ProjectMember.builder()
                .project(project)
                .user(memberToAdd)
                .projectRole(ProjectMemberRole.MEMBER)
                .build();
        project.getMembers().add(pm);
        projectRepository.save(project);
    }

    @Transactional
    public void removeMember(User user, Long projectId, Long userId) {
        Project project = projectRepository.findWithWorkspaceById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);

        project.getMembers().removeIf(pm -> pm.getUser().getId().equals(userId));
        projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getMembers(User user, Long projectId) {
        Project project = projectRepository.findWithWorkspaceById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        
        return project.getMembers().stream().map(pm -> {
            User u = pm.getUser();
            return MemberResponse.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .role(pm.getProjectRole().name())
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getProjectTasks(User user, Long projectId) {
        if (!projectRepository.existsByIdAndWorkspaceOwnerId(projectId, user.getId())) {
            throw new ResourceNotFoundException("Project", projectId);
        }
        return taskRepository.findByProjectIdOrderByUpdatedAtDesc(projectId)
                .stream().map(this::taskToResponse).toList();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void assertOwner(User user, Project project) {
        if (!project.getWorkspace().getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this project");
        }
    }

    public ProjectResponse toResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .ownerId(project.getWorkspace().getOwner().getId())
                .ownerName(project.getWorkspace().getOwner().getName())
                .taskCount(project.getTasks().size())
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
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getName() : null)
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
