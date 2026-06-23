package com.example.Tracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsRequest {
    // Profile
    private String name;
    private String avatarUrl;
    private String jobTitle;
    private String bio;
    private String location;
    private String githubUrl;
    private String linkedinUrl;
    private String twitterUrl;

    // Settings
    private String theme;
    private String language;
    private String timezone;
    private String currentFocus;
    private Boolean notifTaskAssignments;
    private Boolean notifMentions;
    private Boolean notifProjectUpdates;
    private Boolean notifMarketing;
}
