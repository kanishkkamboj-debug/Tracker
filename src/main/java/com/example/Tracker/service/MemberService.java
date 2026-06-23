package com.example.Tracker.service;

import com.example.Tracker.dto.MemberResponse;
import com.example.Tracker.entity.TaskStatus;
import com.example.Tracker.entity.User;
import com.example.Tracker.repository.ProjectMemberRepository;
import com.example.Tracker.repository.ProjectRepository;
import com.example.Tracker.repository.TaskRepository;
import com.example.Tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;

    @Transactional(readOnly = true)
    public List<MemberResponse> getAllMembers(User currentUser) {
        List<User> users = userRepository.findAll();
        List<MemberResponse> results = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (User u : users) {
            long totalTasks = taskRepository.countByAssigneeId(u.getId());
            long doneTasks = taskRepository.countByAssigneeIdAndStatus(u.getId(), TaskStatus.DONE);
            long projects = projectMemberRepository.findByUserId(u.getId()).size();

            results.add(MemberResponse.builder()
                    .id(u.getId())
                    .name(u.getName())
                    .email(u.getEmail())
                    .taskCount((int) totalTasks)
                    .completedTaskCount((int) doneTasks)
                    .projectCount((int) projects)
                    .role(u.getRole().name())
                    .joinedAt(u.getCreatedAt().format(fmt))
                    .avatarUrl(u.getAvatarUrl())
                    .jobTitle(u.getJobTitle())
                    .bio(u.getBio())
                    .location(u.getLocation())
                    .githubUrl(u.getGithubUrl())
                    .linkedinUrl(u.getLinkedinUrl())
                    .twitterUrl(u.getTwitterUrl())
                    .build());
        }
        return results;
    }
}
