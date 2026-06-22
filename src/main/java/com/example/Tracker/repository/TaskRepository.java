package com.example.Tracker.repository;

import com.example.Tracker.entity.Task;
import com.example.Tracker.entity.TaskPriority;
import com.example.Tracker.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // Tasks for a project (used in Kanban board)
    @EntityGraph(attributePaths = {"project"})
    List<Task> findByProjectIdOrderByUpdatedAtDesc(Long projectId);

    // Paginated tasks for a project
    Page<Task> findByProjectId(Long projectId, Pageable pageable);

    // Count all tasks owned by user (via project ownership)
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.owner.id = :ownerId")
    long countByProjectWorkspaceOwnerId(@Param("ownerId") Long ownerId);

    // Count by status across all user's projects
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.owner.id = :ownerId AND t.status = :status")
    long countByProjectWorkspaceOwnerIdAndStatus(@Param("ownerId") Long ownerId, @Param("status") TaskStatus status);

    // Count by priority across all user's projects
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.workspace.owner.id = :ownerId AND t.priority = :priority")
    long countByProjectWorkspaceOwnerIdAndPriority(@Param("ownerId") Long ownerId, @Param("priority") TaskPriority priority);

    // 5 most recently updated tasks across all user's projects
    @Query("SELECT t FROM Task t WHERE t.project.workspace.owner.id = :ownerId ORDER BY t.updatedAt DESC LIMIT 5")
    List<Task> findTop5ByProjectWorkspaceOwnerIdOrderByUpdatedAtDesc(@Param("ownerId") Long ownerId);

    // Status distribution for dashboard chart
    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.project.workspace.owner.id = :ownerId GROUP BY t.status")
    List<Object[]> countByStatusForOwner(@Param("ownerId") Long ownerId);

    // Priority distribution for dashboard chart
    @Query("SELECT t.priority, COUNT(t) FROM Task t WHERE t.project.workspace.owner.id = :ownerId GROUP BY t.priority")
    List<Object[]> countByPriorityForOwner(@Param("ownerId") Long ownerId);

    // Count tasks assigned to a specific user
    long countByAssigneeId(Long assigneeId);

    // Count tasks assigned to a specific user filtered by status
    long countByAssigneeIdAndStatus(Long assigneeId, TaskStatus status);

    // All tasks assigned to a specific user
    List<Task> findByAssigneeId(Long assigneeId);
}
