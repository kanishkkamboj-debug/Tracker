package com.example.Tracker.controller;

import com.example.Tracker.dto.ApiResponse;
import com.example.Tracker.dto.MemberResponse;
import com.example.Tracker.entity.User;
import com.example.Tracker.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(memberService.getAllMembers(user)));
    }
}
