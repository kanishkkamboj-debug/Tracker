package com.example.Tracker.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class MilestoneResponse {
    private String id;          // Long → String
    private String title;
    private String description;
    private LocalDate dueDate;
    private boolean completed;
    private String projectId;   // Long → String
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
