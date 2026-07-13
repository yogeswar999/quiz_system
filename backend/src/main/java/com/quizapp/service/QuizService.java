package com.quizapp.service;

import com.quizapp.dto.request.QuizRequest;
import com.quizapp.dto.response.PageResponse;
import com.quizapp.dto.response.QuizResponse;
import com.quizapp.entity.Quiz;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.repository.QuizRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class QuizService {

    private final QuizRepository quizRepository;

    public QuizService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public QuizResponse createQuiz(QuizRequest request) {
        Quiz quiz = new Quiz();
        mapRequestToEntity(request, quiz);
        return toResponse(quizRepository.save(quiz));
    }

    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        mapRequestToEntity(request, quiz);
        return toResponse(quizRepository.save(quiz));
    }

    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new ResourceNotFoundException("Quiz not found with id: " + id);
        }
        quizRepository.deleteById(id);
    }

    public QuizResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
        return toResponse(quiz);
    }

    public PageResponse<QuizResponse> getAllQuizzes(String search, int page, int size) {
        Page<Quiz> quizPage = quizRepository.findBySubjectContainingIgnoreCase(
                search == null ? "" : search, PageRequest.of(page, size));

        var content = quizPage.getContent().stream().map(this::toResponse).toList();

        return new PageResponse<>(content, quizPage.getNumber(), quizPage.getSize(),
                quizPage.getTotalElements(), quizPage.getTotalPages());
    }

    private void mapRequestToEntity(QuizRequest request, Quiz quiz) {
        quiz.setSubject(request.getSubject());
        quiz.setDuration(request.getDuration());
        quiz.setTotalMarks(request.getTotalMarks());
        quiz.setNumberOfQuestions(request.getNumberOfQuestions());
        quiz.setDescription(request.getDescription());
    }

    private QuizResponse toResponse(Quiz quiz) {
        return new QuizResponse(
                quiz.getId(),
                quiz.getSubject(),
                quiz.getDuration(),
                quiz.getTotalMarks(),
                quiz.getNumberOfQuestions(),
                quiz.getDescription(),
                quiz.getQuestions() != null ? quiz.getQuestions().size() : 0
        );
    }
}
