package com.example.Tracker.dto;

import com.example.Tracker.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TaskStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private TaskStatus status;
}
