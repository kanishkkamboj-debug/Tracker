package com.example.Tracker.service;

import com.example.Tracker.dto.NotificationResponse;
import com.example.Tracker.entity.Notification;
import com.example.Tracker.entity.User;
import com.example.Tracker.exception.ResourceNotFoundException;
import com.example.Tracker.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAll(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public long countUnread(User user) {
        return notificationRepository.findByUserIdAndReadStatusFalseOrderByCreatedAtDesc(user.getId()).size();
    }

    @Transactional
    public void markRead(User user, Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not yours");
        }
        n.setReadStatus(true);
        notificationRepository.save(n);
    }

    @Transactional
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
