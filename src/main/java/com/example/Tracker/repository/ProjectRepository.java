package com.example.Tracker.repository;

import com.example.Tracker.entity.Project;
import com.example.Tracker.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Paginated list of projects for a specific owner
    Page<Project> findByWorkspaceOwnerId(Long ownerId, Pageable pageable);

    // Load project WITH workspace in one query (avoids N+1)
    @EntityGraph(attributePaths = {"workspace"})
    Optional<Project> findWithWorkspaceById(Long id);

    // Count by owner
    long countByWorkspaceOwnerId(Long ownerId);

    // Count by owner and status
    long countByWorkspaceOwnerIdAndStatus(Long ownerId, ProjectStatus status);

    // Check ownership
    boolean existsByIdAndWorkspaceOwnerId(Long id, Long ownerId);
}
