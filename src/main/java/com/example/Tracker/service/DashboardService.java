package com.example.Tracker.service;

import com.example.Tracker.dto.DashboardSummaryResponse;
import com.example.Tracker.dto.TaskResponse;
import com.example.Tracker.entity.ProjectStatus;
import com.example.Tracker.entity.TaskPriority;
import com.example.Tracker.entity.TaskStatus;
import com.example.Tracker.entity.User;
import com.example.Tracker.repository.ProjectRepository;
import com.example.Tracker.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final MongoTemplate mongoTemplate;

    public DashboardSummaryResponse getSummary(User user, String projectId) {
        String ownerId = user.getId();

        long totalProjects, activeProjects, completedProjects, onHoldProjects;
        long totalTasks, completedTasks, pendingTasks;
        Map<String, Long> tasksByStatus;
        Map<String, Long> tasksByPriority;
        List<TaskResponse> recentTasks;

        if (projectId != null) {
            // Verify ownership
            if (!projectRepository.existsByIdAndOwnerId(projectId, ownerId)) {
                throw new RuntimeException("Project not found or not owned by user");
            }

            totalProjects = 1;
            activeProjects = 0; completedProjects = 0; onHoldProjects = 0;

            totalTasks    = taskRepository.countByProjectId(projectId);
            completedTasks = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.DONE);
            pendingTasks  = totalTasks - completedTasks;

            tasksByStatus   = aggregateByField("tasks", "projectId", projectId, "status");
            tasksByPriority = aggregateByField("tasks", "projectId", projectId, "priority");
            recentTasks = taskRepository.findTop5ByProjectIdOrderByUpdatedAtDesc(projectId)
                    .stream().map(t -> toTaskResponse(t, null)).toList();

        } else {
            // Global workspace stats
            totalProjects    = projectRepository.countByOwnerId(ownerId);
            activeProjects   = projectRepository.countByOwnerIdAndStatus(ownerId, ProjectStatus.ACTIVE);
            completedProjects = projectRepository.countByOwnerIdAndStatus(ownerId, ProjectStatus.COMPLETED);
            onHoldProjects   = projectRepository.countByOwnerIdAndStatus(ownerId, ProjectStatus.ON_HOLD);

            totalTasks    = taskRepository.countByOwnerId(ownerId);
            completedTasks = taskRepository.countByOwnerIdAndStatus(ownerId, TaskStatus.DONE);
            pendingTasks  = totalTasks - completedTasks;

            tasksByStatus   = aggregateByField("tasks", "ownerId", ownerId, "status");
            tasksByPriority = aggregateByField("tasks", "ownerId", ownerId, "priority");
            recentTasks = taskRepository.findTop5ByOwnerIdOrderByUpdatedAtDesc(ownerId)
                    .stream().map(t -> toTaskResponse(t, null)).toList();
        }

        // Ensure all enum values appear in maps (even if count = 0)
        for (TaskStatus s : TaskStatus.values()) {
            tasksByStatus.putIfAbsent(s.name(), 0L);
        }
        for (TaskPriority p : TaskPriority.values()) {
            tasksByPriority.putIfAbsent(p.name(), 0L);
        }

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

    /**
     * MongoDB aggregation equivalent of:
     *   SELECT <groupField>, COUNT(*) FROM tasks WHERE <filterField> = <filterValue> GROUP BY <groupField>
     */
    private Map<String, Long> aggregateByField(String collection,
                                                String filterField, String filterValue,
                                                String groupField) {
        Aggregation agg = newAggregation(
                match(Criteria.where(filterField).is(filterValue)),
                group(groupField).count().as("count"),
                project("count").and("_id").as("label")
        );

        AggregationResults<org.bson.Document> results =
                mongoTemplate.aggregate(agg, collection, org.bson.Document.class);

        Map<String, Long> map = new LinkedHashMap<>();
        for (org.bson.Document doc : results.getMappedResults()) {
            String label = String.valueOf(doc.get("label"));
            long count = ((Number) doc.get("count")).longValue();
            map.put(label, count);
        }
        return map;
    }

    private TaskResponse toTaskResponse(com.example.Tracker.entity.Task task, String projectName) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .projectId(task.getProjectId())
                .projectName(projectName)
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
