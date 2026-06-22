package com.example.Tracker.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private Long id;
    private String name;
    private String email;
    private int taskCount;
    private int completedTaskCount;
    private int projectCount;
    private String role;
    private String joinedAt;
}
