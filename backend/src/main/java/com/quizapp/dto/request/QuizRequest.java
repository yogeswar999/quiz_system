package com.quizapp.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuizRequest {
    @NotBlank
    private String subject;

    @NotNull
    @Min(1)
    private Integer duration;

    @NotNull
    @Min(1)
    private Integer totalMarks;

    @NotNull
    @Min(1)
    private Integer numberOfQuestions;

    private String description;
}
