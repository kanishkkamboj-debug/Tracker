package com.example.Tracker.repository;

import com.example.Tracker.entity.Project;
import com.example.Tracker.entity.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ProjectRepository extends MongoRepository<Project, String> {

    // Paginated list of projects for a specific owner
    Page<Project> findByOwnerId(String ownerId, Pageable pageable);

    // Count by owner
    long countByOwnerId(String ownerId);

    // Count by owner and status
    long countByOwnerIdAndStatus(String ownerId, ProjectStatus status);

    // Check ownership
    boolean existsByIdAndOwnerId(String id, String ownerId);
}
