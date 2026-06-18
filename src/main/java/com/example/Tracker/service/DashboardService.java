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
    public DashboardSummaryResponse getSummary(User user) {
        Long ownerId = user.getId();

        // Project counts
        long totalProjects  = projectRepository.countByOwnerId(ownerId);
        long activeProjects = projectRepository.countByOwnerIdAndStatus(ownerId, ProjectStatus.ACTIVE);
        long completedProjects = projectRepository.countByOwnerIdAndStatus(ownerId, ProjectStatus.COMPLETED);
        long onHoldProjects = projectRepository.countByOwnerIdAndStatus(ownerId, ProjectStatus.ON_HOLD);

        // Task counts
        long totalTasks     = taskRepository.countByProjectOwnerId(ownerId);
        long completedTasks = taskRepository.countByProjectOwnerIdAndStatus(ownerId, TaskStatus.DONE);
        long pendingTasks   = totalTasks - completedTasks;

        // Tasks by status (for chart)
        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        for (Object[] row : taskRepository.countByStatusForOwner(ownerId)) {
            tasksByStatus.put(((TaskStatus) row[0]).name(), (Long) row[1]);
        }
        // Ensure all statuses present
        for (TaskStatus s : TaskStatus.values()) {
            tasksByStatus.putIfAbsent(s.name(), 0L);
        }

        // Tasks by priority (for chart)
        Map<String, Long> tasksByPriority = new LinkedHashMap<>();
        for (Object[] row : taskRepository.countByPriorityForOwner(ownerId)) {
            tasksByPriority.put(((TaskPriority) row[0]).name(), (Long) row[1]);
        }
        for (TaskPriority p : TaskPriority.values()) {
            tasksByPriority.putIfAbsent(p.name(), 0L);
        }

        // Recent tasks
        List<TaskResponse> recentTasks = taskRepository
                .findTop5ByProjectOwnerIdOrderByUpdatedAtDesc(ownerId)
                .stream()
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
                .assigneeName(task.getAssigneeName())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
