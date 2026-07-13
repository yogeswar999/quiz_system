package com.quizapp.controller;

import com.quizapp.dto.response.ApiResponse;
import com.quizapp.service.QuizAccessService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz-access")
public class QuizAccessController {

    private final QuizAccessService quizAccessService;

    public QuizAccessController(QuizAccessService quizAccessService) {
        this.quizAccessService = quizAccessService;
    }

    /** Admin only: unlock a specific user's lock record so they can retake that quiz once more. */
    @PostMapping("/{lockId}/unlock")
    public ApiResponse<Void> unlock(@PathVariable Long lockId) {
        quizAccessService.unlock(lockId);
        return ApiResponse.ok("Quiz unlocked for this user", null);
    }
}
