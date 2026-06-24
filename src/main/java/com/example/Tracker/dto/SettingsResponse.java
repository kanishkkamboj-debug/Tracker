package com.example.Tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsResponse {
    // Profile
    private String userId;      // Long → String
    private String name;
    private String email;
    private String avatarUrl;
    private String jobTitle;
    private String bio;
    private String location;
    private String githubUrl;
    private String linkedinUrl;
    private String twitterUrl;

    // Settings (settingsId removed — settings are now embedded inside User)
    private String theme;
    private String language;
    private String timezone;
    private String currentFocus;
    private boolean notifTaskAssignments;
    private boolean notifMentions;
    private boolean notifProjectUpdates;
    private boolean notifMarketing;
}
