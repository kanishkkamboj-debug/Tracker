package com.example.Tracker.repository;

import com.example.Tracker.entity.Project;
import com.example.Tracker.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    // Paginated list of projects for a specific owner
    Page<Project> findByOwnerId(Long ownerId, Pageable pageable);

    // Load project WITH owner in one query (avoids N+1)
    @EntityGraph(attributePaths = {"owner"})
    Optional<Project> findWithOwnerById(Long id);

    // Count by owner
    long countByOwnerId(Long ownerId);

    // Count by owner and status
    long countByOwnerIdAndStatus(Long ownerId, ProjectStatus status);

    // Check ownership
    boolean existsByIdAndOwnerId(Long id, Long ownerId);
}
