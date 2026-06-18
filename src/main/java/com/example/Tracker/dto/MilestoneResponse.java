package com.example.Tracker.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class MilestoneResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private boolean completed;
    private Long projectId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
