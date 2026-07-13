package com.quizapp.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ResultSubmitRequest {
    private String email;
    private Long quizId;
    private List<AnswerSubmission> answers;
    private Long timeTakenSeconds;
}
