package com.example.Tracker.controller;

import com.example.Tracker.dto.SettingsRequest;
import com.example.Tracker.dto.SettingsResponse;
import com.example.Tracker.entity.User;
import com.example.Tracker.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<SettingsResponse> getSettings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(settingsService.getSettings(user));
    }

    @PutMapping
    public ResponseEntity<SettingsResponse> updateSettings(
            @AuthenticationPrincipal User user,
            @RequestBody SettingsRequest request) {
        return ResponseEntity.ok(settingsService.updateSettings(user, request));
    }
}
