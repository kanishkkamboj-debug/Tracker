package com.example.Tracker.service;

import com.example.Tracker.dto.MilestoneRequest;
import com.example.Tracker.dto.MilestoneResponse;
import com.example.Tracker.entity.Milestone;
import com.example.Tracker.exception.ResourceNotFoundException;
import com.example.Tracker.repository.MilestoneRepository;
import com.example.Tracker.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    public List<MilestoneResponse> getMilestonesByProject(String projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", projectId);
        }
        return milestoneRepository.findByProjectIdOrderByDueDateAsc(projectId)
                .stream().map(this::toResponse).toList();
    }

    public MilestoneResponse getMilestoneById(String id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", id));
        return toResponse(milestone);
    }

    public MilestoneResponse createMilestone(String projectId, MilestoneRequest request) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", projectId);
        }

        Milestone milestone = Milestone.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .completed(request.isCompleted())
                .projectId(projectId)
                .build();

        Milestone saved = milestoneRepository.save(milestone);
        return toResponse(saved);
    }

    public MilestoneResponse updateMilestone(String id, MilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", id));

        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setDueDate(request.getDueDate());
        milestone.setCompleted(request.isCompleted());
        milestone.setUpdatedAt(LocalDateTime.now());

        Milestone saved = milestoneRepository.save(milestone);
        return toResponse(saved);
    }

    public void deleteMilestone(String id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", id));
        milestoneRepository.delete(milestone);
    }

    private MilestoneResponse toResponse(Milestone milestone) {
        return MilestoneResponse.builder()
                .id(milestone.getId())
                .title(milestone.getTitle())
                .description(milestone.getDescription())
                .dueDate(milestone.getDueDate())
                .completed(milestone.isCompleted())
                .projectId(milestone.getProjectId())
                .createdAt(milestone.getCreatedAt())
                .updatedAt(milestone.getUpdatedAt())
                .build();
    }
}
