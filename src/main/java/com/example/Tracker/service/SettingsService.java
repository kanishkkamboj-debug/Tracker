package com.example.Tracker.service;

import com.example.Tracker.dto.SettingsRequest;
import com.example.Tracker.dto.SettingsResponse;
import com.example.Tracker.entity.User;
import com.example.Tracker.entity.UserSettings;
import com.example.Tracker.repository.UserRepository;
import com.example.Tracker.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;

    @Transactional
    public SettingsResponse getSettings(User user) {
        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> createDefaultSettings(user));
        return mapToResponse(user, settings);
    }

    @Transactional
    public SettingsResponse updateSettings(User user, SettingsRequest request) {
        // Update Profile in User
        if (request.getName() != null) user.setName(request.getName());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getJobTitle() != null) user.setJobTitle(request.getJobTitle());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getTwitterUrl() != null) user.setTwitterUrl(request.getTwitterUrl());
        
        userRepository.save(user);

        // Update Settings
        UserSettings settings = userSettingsRepository.findByUser(user)
                .orElseGet(() -> createDefaultSettings(user));

        if (request.getTheme() != null) settings.setTheme(request.getTheme());
        if (request.getLanguage() != null) settings.setLanguage(request.getLanguage());
        if (request.getTimezone() != null) settings.setTimezone(request.getTimezone());
        if (request.getCurrentFocus() != null) settings.setCurrentFocus(request.getCurrentFocus());
        if (request.getNotifTaskAssignments() != null) settings.setNotifTaskAssignments(request.getNotifTaskAssignments());
        if (request.getNotifMentions() != null) settings.setNotifMentions(request.getNotifMentions());
        if (request.getNotifProjectUpdates() != null) settings.setNotifProjectUpdates(request.getNotifProjectUpdates());
        if (request.getNotifMarketing() != null) settings.setNotifMarketing(request.getNotifMarketing());

        settings = userSettingsRepository.save(settings);

        return mapToResponse(user, settings);
    }

    private UserSettings createDefaultSettings(User user) {
        UserSettings settings = UserSettings.builder()
                .user(user)
                .theme("system")
                .language("en")
                .timezone("UTC")
                .notifTaskAssignments(true)
                .notifMentions(true)
                .notifProjectUpdates(true)
                .notifMarketing(false)
                .build();
        return userSettingsRepository.save(settings);
    }

    private SettingsResponse mapToResponse(User user, UserSettings settings) {
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
                .settingsId(settings.getId())
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .timezone(settings.getTimezone())
                .currentFocus(settings.getCurrentFocus())
                .notifTaskAssignments(settings.isNotifTaskAssignments())
                .notifMentions(settings.isNotifMentions())
                .notifProjectUpdates(settings.isNotifProjectUpdates())
                .notifMarketing(settings.isNotifMarketing())
                .build();
    }
}
