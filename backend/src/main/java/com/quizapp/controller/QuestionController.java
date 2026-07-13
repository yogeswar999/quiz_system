package com.quizapp.controller;

import com.quizapp.dto.request.BulkQuestionRequest;
import com.quizapp.dto.request.QuestionRequest;
import com.quizapp.dto.response.ApiResponse;
import com.quizapp.dto.response.QuestionResponse;
import com.quizapp.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public ApiResponse<QuestionResponse> addQuestion(@Valid @RequestBody QuestionRequest request) {
        return ApiResponse.ok("Question added successfully", questionService.addQuestion(request));
    }

    @PostMapping("/bulk")
    public ApiResponse<List<QuestionResponse>> addBulkQuestions(@Valid @RequestBody BulkQuestionRequest request) {
        List<QuestionResponse> created = questionService.addBulkQuestions(request);
        return ApiResponse.ok(created.size() + " questions added successfully", created);
    }

    @PutMapping("/{id}")
    public ApiResponse<QuestionResponse> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
        return ApiResponse.ok("Question updated successfully", questionService.updateQuestion(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ApiResponse.ok("Question deleted successfully", null);
    }

    @GetMapping("/quiz/{quizId}")
    public ApiResponse<List<QuestionResponse>> getQuestionsByQuiz(
            @PathVariable Long quizId,
            @RequestParam(required = false) String search) {
        return ApiResponse.ok("Questions fetched successfully", questionService.getQuestionsByQuiz(quizId, search));
    }
}
