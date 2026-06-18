package com.example.Tracker.repository;

import com.example.Tracker.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByProjectIdOrderByTimestampDesc(Long projectId);
    List<ActivityLog> findByTaskIdOrderByTimestampDesc(Long taskId);
}
