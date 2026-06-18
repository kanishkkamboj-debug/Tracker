package com.example.Tracker.dto;

import com.example.Tracker.entity.TaskPriority;
import com.example.Tracker.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 300, message = "Title must be at most 300 characters")
    private String title;

    @Size(max = 5000, message = "Description too long")
    private String description;

    private TaskPriority priority;
    private TaskStatus status;

    private LocalDate dueDate;

    @Size(max = 100, message = "Assignee name must be at most 100 characters")
    private String assigneeName;

    @NotNull(message = "Project ID is required")
    private Long projectId;
}
