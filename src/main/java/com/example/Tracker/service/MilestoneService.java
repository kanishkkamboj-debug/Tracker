package com.example.Tracker.service;

import com.example.Tracker.dto.MilestoneRequest;
import com.example.Tracker.dto.MilestoneResponse;
import com.example.Tracker.entity.Milestone;
import com.example.Tracker.entity.Project;
import com.example.Tracker.exception.ResourceNotFoundException;
import com.example.Tracker.repository.MilestoneRepository;
import com.example.Tracker.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<MilestoneResponse> getMilestonesByProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project", projectId);
        }
        return milestoneRepository.findByProjectIdOrderByDueDateAsc(projectId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MilestoneResponse getMilestoneById(Long id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", id));
        return toResponse(milestone);
    }

    @Transactional
    public MilestoneResponse createMilestone(Long projectId, MilestoneRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));

        Milestone milestone = Milestone.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .completed(request.isCompleted())
                .project(project)
                .build();

        @SuppressWarnings("null")
        Milestone saved = milestoneRepository.save(milestone);
        return toResponse(saved);
    }

    @Transactional
    public MilestoneResponse updateMilestone(Long id, MilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone", id));

        milestone.setTitle(request.getTitle());
        milestone.setDescription(request.getDescription());
        milestone.setDueDate(request.getDueDate());
        milestone.setCompleted(request.isCompleted());
        milestone.setUpdatedAt(LocalDateTime.now());

        @SuppressWarnings("null")
        Milestone saved = milestoneRepository.save(milestone);
        return toResponse(saved);
    }

    @Transactional
    public void deleteMilestone(Long id) {
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
                .projectId(milestone.getProject().getId())
                .createdAt(milestone.getCreatedAt())
                .updatedAt(milestone.getUpdatedAt())
                .build();
    }
}
