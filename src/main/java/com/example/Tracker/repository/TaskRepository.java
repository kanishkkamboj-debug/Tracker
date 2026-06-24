package com.example.Tracker.repository;

import com.example.Tracker.entity.Task;
import com.example.Tracker.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {

    // Tasks for a project (used in Kanban board)
    List<Task> findByProjectIdOrderByUpdatedAtDesc(String projectId);

    // Paginated tasks for a project
    Page<Task> findByProjectId(String projectId, Pageable pageable);

    // Count all tasks owned by user (ownerId denormalized from project.ownerId)
    long countByOwnerId(String ownerId);

    // Count by status across all user's projects
    long countByOwnerIdAndStatus(String ownerId, TaskStatus status);

    // 5 most recently updated tasks across all user's projects
    List<Task> findTop5ByOwnerIdOrderByUpdatedAtDesc(String ownerId);

    // --- Project Specific Dashboard Queries ---
    long countByProjectId(String projectId);
    long countByProjectIdAndStatus(String projectId, TaskStatus status);

    List<Task> findTop5ByProjectIdOrderByUpdatedAtDesc(String projectId);

    // Count tasks assigned to a specific user
    long countByAssigneeId(String assigneeId);

    // Count tasks assigned to a specific user filtered by status
    long countByAssigneeIdAndStatus(String assigneeId, TaskStatus status);

    // All tasks assigned to a specific user
    List<Task> findByAssigneeId(String assigneeId);
}
