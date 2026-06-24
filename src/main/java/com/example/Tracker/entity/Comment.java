package com.example.Tracker.entity;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Embedded POJO — stored inside the Task document as 'comments' list.
 * No longer a separate MongoDB collection or JPA table.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Comment {

    /** Preserved MySQL id as string for client references. */
    private String id;

    private String content;

    /** Reference to the User who wrote this comment. */
    private String authorId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
