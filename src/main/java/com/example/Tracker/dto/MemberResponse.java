package com.example.Tracker.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private String id;          // Long → String
    private String name;
    private String email;
    private int taskCount;
    private int completedTaskCount;
    private int projectCount;
    private String role;
    private String joinedAt;
    private String avatarUrl;
    private String jobTitle;
    private String bio;
    private String location;
    private String githubUrl;
    private String linkedinUrl;
    private String twitterUrl;
}
