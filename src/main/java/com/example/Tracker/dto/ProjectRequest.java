package com.example.Tracker.dto;

import com.example.Tracker.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 200, message = "Name must be at most 200 characters")
    private String name;

    @Size(max = 5000, message = "Description too long")
    private String description;

    private ProjectStatus status;

    private LocalDate startDate;
    private LocalDate endDate;
}
