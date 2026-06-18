package com.example.Tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long onHoldProjects;
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;       // Combines To-Do, In-Progress, and Review
    private Map<String, Long> tasksByStatus;
    private Map<String, Long> tasksByPriority;
    private List<TaskResponse> recentTasks;
}
