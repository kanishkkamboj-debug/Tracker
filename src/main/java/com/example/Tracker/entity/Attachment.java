package com.example.Tracker.entity;

import lombok.*;

import java.time.LocalDateTime;

/**
 * Embedded POJO — stored inside the Task document as 'attachments' list.
 * No longer a separate MongoDB collection or JPA table.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Attachment {

    /** Preserved MySQL id as string for client references. */
    private String id;

    private String fileName;
    private String fileUrl;

    /** Reference to the User who uploaded this file. */
    private String uploadedById;

    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
