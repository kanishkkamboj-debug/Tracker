package com.example.Tracker.repository;

import com.example.Tracker.entity.Sprint;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SprintRepository extends MongoRepository<Sprint, String> {
    List<Sprint> findByProjectId(String projectId);
}
