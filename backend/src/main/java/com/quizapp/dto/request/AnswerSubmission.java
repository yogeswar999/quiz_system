package com.quizapp.dto.request;

import lombok.Data;

@Data
public class AnswerSubmission {
    private Long questionId;
    /** "A", "B", "C", "D", or null if unanswered */
    private String selectedOption;
}
