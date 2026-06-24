package com.example.Tracker.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tasks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Task {

    @Id
    private String id;

    private String title;
    private String description;

    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    private LocalDate dueDate;

    /** Reference to the assigned User (null if unassigned). */
    @Indexed
    private String assigneeId;

    /** Reference to the parent Project. */
    @Indexed
    private String projectId;

    /**
     * Denormalized from project.ownerId for efficient dashboard queries.
     * Allows counting tasks per workspace owner without cross-collection joins.
     */
    @Indexed
    private String ownerId;

    /** Reference to the Sprint this task belongs to (nullable). */
    private String sprintId;

    /** Reference to the parent Task for sub-tasks (nullable). */
    private String parentTaskId;

    /** Embedded comments — replaces the former comments table. */
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    /** Embedded attachments — replaces the former attachments table. */
    @Builder.Default
    private List<Attachment> attachments = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Indexed
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
