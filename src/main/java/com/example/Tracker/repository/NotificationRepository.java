package com.example.Tracker.repository;

import com.example.Tracker.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndReadStatusFalseOrderByCreatedAtDesc(String userId);
}
