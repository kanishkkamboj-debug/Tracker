package com.example.Tracker.service;

import com.example.Tracker.dto.TaskRequest;
import com.example.Tracker.dto.TaskResponse;
import com.example.Tracker.dto.TaskStatusUpdateRequest;
import com.example.Tracker.entity.Project;
import com.example.Tracker.entity.Task;
import com.example.Tracker.entity.TaskPriority;
import com.example.Tracker.entity.TaskStatus;
import com.example.Tracker.entity.User;
import com.example.Tracker.exception.ResourceNotFoundException;
import com.example.Tracker.exception.UnauthorizedException;
import com.example.Tracker.repository.ProjectRepository;
import com.example.Tracker.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public TaskResponse createTask(User user, TaskRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", request.getProjectId()));

        if (!project.getWorkspace().getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this project");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .dueDate(request.getDueDate())
                .project(project)
                .build();

        @SuppressWarnings("null")
        Task savedTask = taskRepository.save(task);
        return toResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTask(User user, Long taskId, TaskRequest request) {
        Task task = getTaskAndVerifyOwner(user, taskId);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setUpdatedAt(LocalDateTime.now());

        @SuppressWarnings("null")
        Task savedTask = taskRepository.save(task);
        return toResponse(savedTask);
    }

    @Transactional
    public TaskResponse updateTaskStatus(User user, Long taskId, TaskStatusUpdateRequest request) {
        Task task = getTaskAndVerifyOwner(user, taskId);
        task.setStatus(request.getStatus());
        task.setUpdatedAt(LocalDateTime.now());
        @SuppressWarnings("null")
        Task savedTask = taskRepository.save(task);
        return toResponse(savedTask);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(User user, Long taskId) {
        Task task = getTaskAndVerifyOwner(user, taskId);
        return toResponse(task);
    }

    @Transactional
    public void deleteTask(User user, Long taskId) {
        Task task = getTaskAndVerifyOwner(user, taskId);
        taskRepository.delete(task);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Task getTaskAndVerifyOwner(User user, Long taskId) {
        @SuppressWarnings("null")
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        if (!task.getProject().getWorkspace().getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this task");
        }
        return task;
    }

    public TaskResponse toResponse(Task task) {
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
