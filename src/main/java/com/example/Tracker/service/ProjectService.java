package com.example.Tracker.service;

import com.example.Tracker.dto.ProjectRequest;
import com.example.Tracker.dto.ProjectResponse;
import com.example.Tracker.dto.TaskResponse;
import com.example.Tracker.entity.Project;
import com.example.Tracker.entity.ProjectStatus;
import com.example.Tracker.entity.Task;
import com.example.Tracker.entity.User;
import com.example.Tracker.exception.ResourceNotFoundException;
import com.example.Tracker.exception.UnauthorizedException;
import com.example.Tracker.repository.ProjectRepository;
import com.example.Tracker.repository.TaskRepository;
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

    @Transactional(readOnly = true)
    public Page<ProjectResponse> getProjects(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return projectRepository.findByOwnerId(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional
    public ProjectResponse createProject(User user, ProjectRequest request) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : ProjectStatus.ACTIVE)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .owner(user)
                .build();

        return toResponse(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(User user, Long projectId) {
        Project project = projectRepository.findWithOwnerById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);
        return toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(User user, Long projectId, ProjectRequest request) {
        Project project = projectRepository.findWithOwnerById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setUpdatedAt(LocalDateTime.now());

        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(User user, Long projectId) {
        Project project = projectRepository.findWithOwnerById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
        assertOwner(user, project);
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getProjectTasks(User user, Long projectId) {
        if (!projectRepository.existsByIdAndOwnerId(projectId, user.getId())) {
            throw new ResourceNotFoundException("Project", projectId);
        }
        return taskRepository.findByProjectIdOrderByUpdatedAtDesc(projectId)
                .stream().map(this::taskToResponse).toList();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void assertOwner(User user, Project project) {
        if (!project.getOwner().getId().equals(user.getId())) {
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
                .ownerId(project.getOwner().getId())
                .ownerName(project.getOwner().getName())
                .taskCount(project.getTasks().size())
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
                .assigneeName(task.getAssigneeName())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
