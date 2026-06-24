package com.example.Tracker.dto;

import com.example.Tracker.entity.ProjectStatus;
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
public class ProjectResponse {
    private String id;          // Long → String
    private String name;
    private String description;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private String ownerId;     // Long → String
    private String ownerName;
    private int taskCount;
    private String githubRepoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
