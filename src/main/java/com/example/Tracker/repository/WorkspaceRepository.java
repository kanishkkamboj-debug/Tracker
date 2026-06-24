package com.example.Tracker.repository;

import com.example.Tracker.entity.Workspace;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface WorkspaceRepository extends MongoRepository<Workspace, String> {
    List<Workspace> findByOwnerId(String ownerId);
}
