package com.example.Tracker.controller;

import com.example.Tracker.dto.ApiResponse;
import com.example.Tracker.dto.MilestoneRequest;
import com.example.Tracker.dto.MilestoneResponse;
import com.example.Tracker.service.MilestoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for milestone endpoints.
 */
@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getMilestonesByProject(@PathVariable Long projectId) {
        List<MilestoneResponse> milestones = milestoneService.getMilestonesByProject(projectId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Milestones fetched successfully", milestones));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> getMilestoneById(@PathVariable Long id) {
        MilestoneResponse milestone = milestoneService.getMilestoneById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Milestone fetched successfully", milestone));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MilestoneResponse>> createMilestone(
            @RequestParam Long projectId,
            @Valid @RequestBody MilestoneRequest request) {
        MilestoneResponse milestone = milestoneService.createMilestone(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Milestone created successfully", milestone));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestone(@PathVariable Long id,
            @Valid @RequestBody MilestoneRequest request) {
        MilestoneResponse milestone = milestoneService.updateMilestone(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Milestone updated successfully", milestone));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(@PathVariable Long id) {
        milestoneService.deleteMilestone(id);
        return ResponseEntity.noContent().build();
    }
}
