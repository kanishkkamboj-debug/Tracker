package com.example.Tracker.repository;

import com.example.Tracker.entity.ActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findByProjectIdOrderByTimestampDesc(String projectId);
    List<ActivityLog> findByTaskIdOrderByTimestampDesc(String taskId);
}
