package com.quizapp.exception;

public class QuizLockedException extends RuntimeException {
    public QuizLockedException(String message) {
        super(message);
    }
}
