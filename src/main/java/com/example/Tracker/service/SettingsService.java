package com.example.Tracker.service;

import com.example.Tracker.dto.SettingsRequest;
import com.example.Tracker.dto.SettingsResponse;
import com.example.Tracker.entity.User;
import com.example.Tracker.entity.UserSettings;
import com.example.Tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserRepository userRepository;

    public SettingsResponse getSettings(User user) {
        if (user.getSettings() == null) {
            user.setSettings(defaultSettings());
            userRepository.save(user);
        }
        return mapToResponse(user);
    }

    public SettingsResponse updateSettings(User user, SettingsRequest request) {
        // Update profile fields on User
        if (request.getName() != null)        user.setName(request.getName());
        if (request.getAvatarUrl() != null)   user.setAvatarUrl(request.getAvatarUrl());
        if (request.getJobTitle() != null)    user.setJobTitle(request.getJobTitle());
        if (request.getBio() != null)         user.setBio(request.getBio());
        if (request.getLocation() != null)    user.setLocation(request.getLocation());
        if (request.getGithubUrl() != null)   user.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getTwitterUrl() != null)  user.setTwitterUrl(request.getTwitterUrl());

        // Update embedded settings
        UserSettings settings = user.getSettings() != null ? user.getSettings() : defaultSettings();
        if (request.getTheme() != null)              settings.setTheme(request.getTheme());
        if (request.getLanguage() != null)           settings.setLanguage(request.getLanguage());
        if (request.getTimezone() != null)           settings.setTimezone(request.getTimezone());
        if (request.getCurrentFocus() != null)       settings.setCurrentFocus(request.getCurrentFocus());
        if (request.getNotifTaskAssignments() != null)
            settings.setNotifTaskAssignments(request.getNotifTaskAssignments());
        if (request.getNotifMentions() != null)
            settings.setNotifMentions(request.getNotifMentions());
        if (request.getNotifProjectUpdates() != null)
            settings.setNotifProjectUpdates(request.getNotifProjectUpdates());
        if (request.getNotifMarketing() != null)
            settings.setNotifMarketing(request.getNotifMarketing());

        user.setSettings(settings);
        userRepository.save(user);

        return mapToResponse(user);
    }

    private UserSettings defaultSettings() {
        return UserSettings.builder().build(); // all @Builder.Default values applied
    }

    private SettingsResponse mapToResponse(User user) {
        UserSettings s = user.getSettings() != null ? user.getSettings() : defaultSettings();
        return SettingsResponse.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .jobTitle(user.getJobTitle())
                .bio(user.getBio())
                .location(user.getLocation())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .twitterUrl(user.getTwitterUrl())
                .theme(s.getTheme())
                .language(s.getLanguage())
                .timezone(s.getTimezone())
                .currentFocus(s.getCurrentFocus())
                .notifTaskAssignments(s.isNotifTaskAssignments())
                .notifMentions(s.isNotifMentions())
                .notifProjectUpdates(s.isNotifProjectUpdates())
                .notifMarketing(s.isNotifMarketing())
                .build();
    }
}
