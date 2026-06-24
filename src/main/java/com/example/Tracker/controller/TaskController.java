package com.example.Tracker.controller;

import com.example.Tracker.dto.*;
import com.example.Tracker.entity.User;
import com.example.Tracker.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse created = taskService.createTask(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> getTask(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {           // Long → String
        return ResponseEntity.ok(ApiResponse.success(taskService.getTask(user, id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @AuthenticationPrincipal User user,
            @PathVariable String id,             // Long → String
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Task updated",
                taskService.updateTask(user, id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @AuthenticationPrincipal User user,
            @PathVariable String id,             // Long → String
            @Valid @RequestBody TaskStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                taskService.updateTaskStatus(user, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {           // Long → String
        taskService.deleteTask(user, id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted", null));
    }
}
