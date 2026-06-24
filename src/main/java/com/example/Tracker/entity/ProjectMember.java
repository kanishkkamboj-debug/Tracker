package com.example.Tracker.entity;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Embedded POJO — stored inside the Project document as 'members' list.
 * No longer a separate MongoDB collection or JPA table.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProjectMember {

    /** Reference to the User. */
    private String userId;

    @Builder.Default
    private ProjectMemberRole projectRole = ProjectMemberRole.MEMBER;

    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();
}
