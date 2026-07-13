package com.quizapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResultResponse {
    private Long id;
    private String email;
    private String subject;
    private Long quizId;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer marksObtained;
    private Integer totalMarks;
    private Double percentage;
    private Boolean passed;
    private Long timeTakenSeconds;
    private LocalDateTime submissionTime;
    private Boolean locked;
    private Long lockId;
    private Boolean published;
}
