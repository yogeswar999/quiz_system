package com.quizapp.controller;

import com.quizapp.dto.request.QuizRequest;
import com.quizapp.dto.response.ApiResponse;
import com.quizapp.dto.response.PageResponse;
import com.quizapp.dto.response.QuestionForUserResponse;
import com.quizapp.dto.response.QuizResponse;
import com.quizapp.service.QuestionService;
import com.quizapp.service.QuizAccessService;
import com.quizapp.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final QuestionService questionService;
    private final QuizAccessService quizAccessService;

    public QuizController(QuizService quizService, QuestionService questionService,
                           QuizAccessService quizAccessService) {
        this.quizService = quizService;
        this.questionService = questionService;
        this.quizAccessService = quizAccessService;
    }

    @PostMapping
    public ApiResponse<QuizResponse> createQuiz(@Valid @RequestBody QuizRequest request) {
        return ApiResponse.ok("Quiz created successfully", quizService.createQuiz(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<QuizResponse> updateQuiz(@PathVariable Long id, @Valid @RequestBody QuizRequest request) {
        return ApiResponse.ok("Quiz updated successfully", quizService.updateQuiz(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ApiResponse.ok("Quiz deleted successfully", null);
    }

    @GetMapping("/{id}")
    public ApiResponse<QuizResponse> getQuizById(@PathVariable Long id) {
        return ApiResponse.ok("Quiz fetched successfully", quizService.getQuizById(id));
    }

    @GetMapping
    public ApiResponse<PageResponse<QuizResponse>> getAllQuizzes(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok("Quizzes fetched successfully", quizService.getAllQuizzes(search, page, size));
    }

    /** Logged-in user only: checks whether THIS user is locked out of retaking this quiz. */
    @GetMapping("/{id}/access-status")
    public ApiResponse<Map<String, Boolean>> getAccessStatus(@PathVariable Long id, Authentication authentication) {
        boolean locked = quizAccessService.isLocked(authentication.getName(), id);
        return ApiResponse.ok("Access status fetched", Map.of("locked", locked));
    }

    /** Logged-in user only: returns quiz questions WITHOUT correct answers, for a user taking the test.
     *  Blocks access if this user has already attempted the quiz and is locked. */
    @GetMapping("/{id}/questions-for-user")
    public ApiResponse<List<QuestionForUserResponse>> getQuestionsForUser(@PathVariable Long id, Authentication authentication) {
        quizAccessService.assertNotLocked(authentication.getName(), id);
        return ApiResponse.ok("Questions fetched successfully", questionService.getQuestionsForUser(id));
    }
}
