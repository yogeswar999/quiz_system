package com.quizapp.controller;

import com.quizapp.dto.request.ResultSubmitRequest;
import com.quizapp.dto.response.ApiResponse;
import com.quizapp.dto.response.PageResponse;
import com.quizapp.dto.response.ResultResponse;
import com.quizapp.service.ResultService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @PostMapping("/submit")
    public ApiResponse<ResultResponse> submitResult(@RequestBody ResultSubmitRequest request) {
        return ApiResponse.ok("Quiz submitted successfully", resultService.submitResult(request));
    }

    /** Logged-in user only: their own past attempts, most recent first. */
    @GetMapping("/my")
    public ApiResponse<List<ResultResponse>> getMyResults(Authentication authentication) {
        return ApiResponse.ok("Your results fetched successfully", resultService.getMyResults(authentication.getName()));
    }

    /** A single result — a user can only view their own; admins can view any. */
    @GetMapping("/{id}")
    public ApiResponse<ResultResponse> getResultById(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        ResultResponse response = isAdmin
                ? resultService.getResultById(id)
                : resultService.getResultForUser(id, authentication.getName());

        return ApiResponse.ok("Result fetched successfully", response);
    }

    @GetMapping
    public ApiResponse<PageResponse<ResultResponse>> getAllResults(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok("Results fetched successfully", resultService.getAllResults(search, page, size));
    }

    /** Admin only: reveal this result's score to the user who took it. */
    @PostMapping("/{id}/publish")
    public ApiResponse<Void> publish(@PathVariable Long id) {
        resultService.setPublished(id, true);
        return ApiResponse.ok("Result published — the user can now see their score", null);
    }

    /** Admin only: hide this result's score again. */
    @PostMapping("/{id}/unpublish")
    public ApiResponse<Void> unpublish(@PathVariable Long id) {
        resultService.setPublished(id, false);
        return ApiResponse.ok("Result unpublished", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteResult(@PathVariable Long id) {
        resultService.deleteResult(id);
        return ApiResponse.ok("Result deleted successfully", null);
    }
}
