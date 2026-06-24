package com.example.Tracker.repository;

import com.example.Tracker.entity.Milestone;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MilestoneRepository extends MongoRepository<Milestone, String> {
    List<Milestone> findByProjectIdOrderByDueDateAsc(String projectId);
}
