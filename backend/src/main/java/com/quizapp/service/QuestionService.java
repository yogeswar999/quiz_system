package com.quizapp.service;

import com.quizapp.dto.request.BulkQuestionItem;
import com.quizapp.dto.request.BulkQuestionRequest;
import com.quizapp.dto.request.QuestionRequest;
import com.quizapp.dto.response.QuestionForUserResponse;
import com.quizapp.dto.response.QuestionResponse;
import com.quizapp.entity.Question;
import com.quizapp.entity.Quiz;
import com.quizapp.exception.BadRequestException;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.repository.QuestionRepository;
import com.quizapp.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class QuestionService {

    private static final Set<String> VALID_OPTIONS = Set.of("A", "B", "C", "D");

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public QuestionService(QuestionRepository questionRepository, QuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    public QuestionResponse addQuestion(QuestionRequest request) {
        validateCorrectAnswer(request.getCorrectAnswer());

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + request.getQuizId()));

        Question question = new Question();
        mapRequestToEntity(request, question);
        question.setQuiz(quiz);

        return toResponse(questionRepository.save(question));
    }

    /** Adds many questions to a quiz in one call. All-or-nothing: if any question fails
     *  validation, none of them are saved. */
    @Transactional
    public List<QuestionResponse> addBulkQuestions(BulkQuestionRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + request.getQuizId()));

        List<Question> toSave = new ArrayList<>();

        int index = 0;
        for (BulkQuestionItem item : request.getQuestions()) {
            index++;
            if (item.getCorrectAnswer() == null || !VALID_OPTIONS.contains(item.getCorrectAnswer().toUpperCase())) {
                throw new BadRequestException("Question #" + index + ": correct answer must be one of A, B, C, D");
            }

            Question question = new Question();
            question.setQuestionText(item.getQuestionText());
            question.setOptionA(item.getOptionA());
            question.setOptionB(item.getOptionB());
            question.setOptionC(item.getOptionC());
            question.setOptionD(item.getOptionD());
            question.setCorrectAnswer(item.getCorrectAnswer().toUpperCase());
            question.setMarks(item.getMarks());
            question.setQuiz(quiz);

            toSave.add(question);
        }

        return questionRepository.saveAll(toSave).stream().map(this::toResponse).toList();
    }

    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        validateCorrectAnswer(request.getCorrectAnswer());

        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        mapRequestToEntity(request, question);
        return toResponse(questionRepository.save(question));
    }

    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    public List<QuestionResponse> getQuestionsByQuiz(Long quizId, String search) {
        List<Question> questions = (search == null || search.isBlank())
                ? questionRepository.findByQuizId(quizId)
                : questionRepository.findByQuizIdAndQuestionTextContainingIgnoreCase(quizId, search);

        return questions.stream().map(this::toResponse).toList();
    }

    /** Used when a user starts a quiz - correct answers are stripped out. */
    public List<QuestionForUserResponse> getQuestionsForUser(Long quizId) {
        return questionRepository.findByQuizId(quizId).stream()
                .map(q -> new QuestionForUserResponse(
                        q.getId(), q.getQuestionText(), q.getOptionA(), q.getOptionB(),
                        q.getOptionC(), q.getOptionD(), q.getMarks()))
                .toList();
    }

    private void validateCorrectAnswer(String answer) {
        if (answer == null || !VALID_OPTIONS.contains(answer.toUpperCase())) {
            throw new BadRequestException("Correct answer must be one of A, B, C, D");
        }
    }

    private void mapRequestToEntity(QuestionRequest request, Question question) {
        question.setQuestionText(request.getQuestionText());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectAnswer(request.getCorrectAnswer().toUpperCase());
        question.setMarks(request.getMarks());
    }

    private QuestionResponse toResponse(Question q) {
        return new QuestionResponse(q.getId(), q.getQuestionText(), q.getOptionA(), q.getOptionB(),
                q.getOptionC(), q.getOptionD(), q.getCorrectAnswer(), q.getMarks(),
                q.getQuiz().getId());
    }
}
