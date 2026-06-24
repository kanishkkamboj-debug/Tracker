package com.example.Tracker.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "projects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Project {

    @Id
    private String id;

    private String name;
    private String description;

    @Builder.Default
    private ProjectStatus status = ProjectStatus.ACTIVE;

    private LocalDate startDate;
    private LocalDate endDate;
    private String githubRepoUrl;

    /** Reference to the parent Workspace. */
    private String workspaceId;

    /**
     * Denormalized from workspace.ownerId for efficient dashboard queries
     * (avoids a cross-collection join on every count/filter).
     */
    @Indexed
    private String ownerId;

    /** Embedded project members — replaces the former project_members table. */
    @Builder.Default
    private List<ProjectMember> members = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
