package com.example.Tracker.dto;

import com.example.Tracker.entity.TaskPriority;
import com.example.Tracker.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private String id;           // Long → String
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDate dueDate;
    private String assigneeName;
    private String projectId;    // Long → String
    private String projectName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
