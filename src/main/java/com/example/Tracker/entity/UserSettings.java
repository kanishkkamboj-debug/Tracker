package com.example.Tracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String theme = "system";

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String language = "en";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String timezone = "UTC";

    @Column(length = 255)
    private String currentFocus;

    @Column(nullable = false)
    @Builder.Default
    private boolean notifTaskAssignments = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean notifMentions = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean notifProjectUpdates = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean notifMarketing = false;
}
