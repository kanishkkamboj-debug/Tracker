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
    public ResponseEntity<ApiResponse<List<MilestoneResponse>>> getMilestonesByProject(
            @PathVariable String projectId) {    // Long → String
        List<MilestoneResponse> milestones = milestoneService.getMilestonesByProject(projectId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Milestones fetched successfully", milestones));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> getMilestoneById(
            @PathVariable String id) {           // Long → String
        MilestoneResponse milestone = milestoneService.getMilestoneById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Milestone fetched successfully", milestone));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MilestoneResponse>> createMilestone(
            @RequestParam String projectId,      // Long → String
            @Valid @RequestBody MilestoneRequest request) {
        MilestoneResponse milestone = milestoneService.createMilestone(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Milestone created successfully", milestone));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestone(
            @PathVariable String id,             // Long → String
            @Valid @RequestBody MilestoneRequest request) {
        MilestoneResponse milestone = milestoneService.updateMilestone(id, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Milestone updated successfully", milestone));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(
            @PathVariable String id) {           // Long → String
        milestoneService.deleteMilestone(id);
        return ResponseEntity.noContent().build();
    }
}
