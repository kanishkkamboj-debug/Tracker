package com.example.Tracker.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;          // Long → String
    private String title;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdAt;
}
