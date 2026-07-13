package com.quizapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Same as QuestionResponse but WITHOUT the correct answer - safe to send to users taking the quiz. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionForUserResponse {
    private Long id;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private Integer marks;
}
