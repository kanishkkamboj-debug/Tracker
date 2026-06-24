package com.example.Tracker.controller;

import com.example.Tracker.dto.ApiResponse;
import com.example.Tracker.dto.DashboardSummaryResponse;
import com.example.Tracker.entity.User;
import com.example.Tracker.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String projectId) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSummary(user, projectId)));
    }
}
