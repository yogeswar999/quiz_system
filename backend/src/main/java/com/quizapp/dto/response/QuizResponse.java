package com.quizapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizResponse {
    private Long id;
    private String subject;
    private Integer duration;
    private Integer totalMarks;
    private Integer numberOfQuestions;
    private String description;
    private Integer actualQuestionCount;
}
