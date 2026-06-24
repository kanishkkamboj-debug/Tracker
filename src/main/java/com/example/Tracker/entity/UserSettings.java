package com.example.Tracker.entity;

import lombok.*;

/**
 * Embedded POJO — stored inside the User document as 'settings'.
 * No longer a separate MongoDB collection or JPA table.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSettings {

    @Builder.Default
    private String theme = "system";

    @Builder.Default
    private String language = "en";

    @Builder.Default
    private String timezone = "UTC";

    private String currentFocus;

    @Builder.Default
    private boolean notifTaskAssignments = true;

    @Builder.Default
    private boolean notifMentions = true;

    @Builder.Default
    private boolean notifProjectUpdates = true;

    @Builder.Default
    private boolean notifMarketing = false;
}
