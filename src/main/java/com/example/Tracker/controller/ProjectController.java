package com.example.Tracker.controller;

import com.example.Tracker.dto.*;
import com.example.Tracker.entity.User;
import com.example.Tracker.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getProjects(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjects(user, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProjectRequest request) {
        ProjectResponse created = projectService.createProject(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created", created));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {           // Long → String
        return ResponseEntity.ok(ApiResponse.success(projectService.getProject(user, id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @AuthenticationPrincipal User user,
            @PathVariable String id,             // Long → String
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Project updated",
                projectService.updateProject(user, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {           // Long → String
        projectService.deleteProject(user, id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted", null));
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getProjectTasks(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {           // Long → String
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectTasks(user, id)));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getProjectMembers(
            @AuthenticationPrincipal User user,
            @PathVariable String id) {           // Long → String
        return ResponseEntity.ok(ApiResponse.success(projectService.getMembers(user, id)));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<Void>> addProjectMember(
            @AuthenticationPrincipal User user,
            @PathVariable String id,             // Long → String
            @RequestParam String userId) {       // Long → String
        projectService.addMember(user, id, userId);
        return ResponseEntity.ok(ApiResponse.success("Member added", null));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeProjectMember(
            @AuthenticationPrincipal User user,
            @PathVariable String id,             // Long → String
            @PathVariable String userId) {       // Long → String
        projectService.removeMember(user, id, userId);
        return ResponseEntity.ok(ApiResponse.success("Member removed", null));
    }
}
