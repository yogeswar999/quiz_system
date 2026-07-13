package com.quizapp.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkQuestionRequest {
    @NotNull
    private Long quizId;

    @NotEmpty(message = "At least one question is required")
    @Valid
    private List<BulkQuestionItem> questions;
}
