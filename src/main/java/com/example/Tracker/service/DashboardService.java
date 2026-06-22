package com.example.Tracker.service;

import com.example.Tracker.dto.DashboardSummaryResponse;
import com.example.Tracker.dto.TaskResponse;
import com.example.Tracker.entity.ProjectStatus;
import com.example.Tracker.entity.Task;
import com.example.Tracker.entity.TaskPriority;
import com.example.Tracker.entity.TaskStatus;
import com.example.Tracker.entity.User;
import com.example.Tracker.repository.ProjectRepository;
import com.example.Tracker.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(User user, Long projectId) {
        Long ownerId = user.getId();

        long totalProjects, activeProjects, completedProjects, onHoldProjects;
        long totalTasks, completedTasks, pendingTasks;
        List<Object[]> statusCounts, priorityCounts;
        List<Task> topTasks;

        if (projectId != null) {
            // Verify ownership
            if (!projectRepository.existsByIdAndWorkspaceOwnerId(projectId, ownerId)) {
                throw new RuntimeException("Project not found or not owned by user");
            }
            
            // Project counts don't make sense for a single project, so return 0 or 1
            totalProjects = 1;
            activeProjects = 0; completedProjects = 0; onHoldProjects = 0;
            // Or ideally we fetch the project to see its status, but 0 is fine for chart filters

            totalTasks = taskRepository.countByProjectId(projectId);
            completedTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.DONE);
            pendingTasks = totalTasks - completedTasks;

            statusCounts = taskRepository.countByStatusForProject(projectId);
            priorityCounts = taskRepository.countByPriorityForProject(projectId);
            topTasks = taskRepository.findTop5ByProjectIdOrderByUpdatedAtDesc(projectId);
        } else {
            // Global Workspace stats
            totalProjects  = projectRepository.countByWorkspaceOwnerId(ownerId);
            activeProjects = projectRepository.countByWorkspaceOwnerIdAndStatus(ownerId, ProjectStatus.ACTIVE);
            completedProjects = projectRepository.countByWorkspaceOwnerIdAndStatus(ownerId, ProjectStatus.COMPLETED);
            onHoldProjects = projectRepository.countByWorkspaceOwnerIdAndStatus(ownerId, ProjectStatus.ON_HOLD);

            totalTasks     = taskRepository.countByProjectWorkspaceOwnerId(ownerId);
            completedTasks = taskRepository.countByProjectWorkspaceOwnerIdAndStatus(ownerId, TaskStatus.DONE);
            pendingTasks   = totalTasks - completedTasks;

            statusCounts = taskRepository.countByStatusForOwner(ownerId);
            priorityCounts = taskRepository.countByPriorityForOwner(ownerId);
            topTasks = taskRepository.findTop5ByProjectWorkspaceOwnerIdOrderByUpdatedAtDesc(ownerId);
        }

        // Tasks by status (for chart)
        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        for (Object[] row : statusCounts) {
            tasksByStatus.put(((TaskStatus) row[0]).name(), (Long) row[1]);
        }
        for (TaskStatus s : TaskStatus.values()) {
            tasksByStatus.putIfAbsent(s.name(), 0L);
        }

        // Tasks by priority (for chart)
        Map<String, Long> tasksByPriority = new LinkedHashMap<>();
        for (Object[] row : priorityCounts) {
            tasksByPriority.put(((TaskPriority) row[0]).name(), (Long) row[1]);
        }
        for (TaskPriority p : TaskPriority.values()) {
            tasksByPriority.putIfAbsent(p.name(), 0L);
        }

        // Recent tasks
        List<TaskResponse> recentTasks = topTasks.stream()
                .map(this::taskToResponse)
                .toList();

        return DashboardSummaryResponse.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .onHoldProjects(onHoldProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .tasksByStatus(tasksByStatus)
                .tasksByPriority(tasksByPriority)
                .recentTasks(recentTasks)
                .build();
    }

    private TaskResponse taskToResponse(Task task) {
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
