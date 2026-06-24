package com.example.Tracker.service;

import com.example.Tracker.dto.NotificationResponse;
import com.example.Tracker.entity.Notification;
import com.example.Tracker.entity.User;
import com.example.Tracker.exception.ResourceNotFoundException;
import com.example.Tracker.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationResponse> getAll(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    public long countUnread(User user) {
        return notificationRepository
                .findByUserIdAndReadStatusFalseOrderByCreatedAtDesc(user.getId()).size();
    }

    public void markRead(User user, String id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (!n.getUserId().equals(user.getId())) {
            throw new RuntimeException("Not yours");
        }
        n.setReadStatus(true);
        notificationRepository.save(n);
    }

    public void markAllRead(User user) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndReadStatusFalseOrderByCreatedAtDesc(user.getId());
        unread.forEach(n -> n.setReadStatus(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .readStatus(n.isReadStatus())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
