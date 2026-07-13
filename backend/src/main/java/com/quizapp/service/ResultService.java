package com.quizapp.service;

import com.quizapp.dto.request.AnswerSubmission;
import com.quizapp.dto.request.ResultSubmitRequest;
import com.quizapp.dto.response.PageResponse;
import com.quizapp.dto.response.ResultResponse;
import com.quizapp.entity.Question;
import com.quizapp.entity.Quiz;
import com.quizapp.entity.QuizAttemptLock;
import com.quizapp.entity.Result;
import com.quizapp.entity.User;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.exception.UnauthorizedException;
import com.quizapp.repository.QuestionRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.ResultRepository;
import com.quizapp.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResultService {

    private static final double PASS_PERCENTAGE = 40.0;

    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAccessService quizAccessService;

    public ResultService(ResultRepository resultRepository, UserRepository userRepository,
                          QuizRepository quizRepository, QuestionRepository questionRepository,
                          QuizAccessService quizAccessService) {
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.quizAccessService = quizAccessService;
    }

    public ResultResponse submitResult(ResultSubmitRequest request) {
        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + request.getQuizId()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found. Please log in again."));

        // Defense-in-depth: block submission if this user is locked out of the quiz
        // (the UI should already have prevented them from starting it).
        quizAccessService.assertNotLocked(user.getEmail(), quiz.getId());

        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        Map<Long, Question> questionMap = new HashMap<>();
        for (Question q : questions) {
            questionMap.put(q.getId(), q);
        }

        int correct = 0;
        int wrong = 0;
        int marksObtained = 0;
        int totalMarks = 0;

        for (Question q : questions) {
            totalMarks += q.getMarks();
        }

        if (request.getAnswers() != null) {
            for (AnswerSubmission ans : request.getAnswers()) {
                Question q = questionMap.get(ans.getQuestionId());
                if (q == null) continue;

                if (ans.getSelectedOption() != null
                        && ans.getSelectedOption().equalsIgnoreCase(q.getCorrectAnswer())) {
                    correct++;
                    marksObtained += q.getMarks();
                } else if (ans.getSelectedOption() != null) {
                    wrong++;
                }
            }
        }

        int totalQuestions = questions.size();

        double percentage = totalMarks == 0 ? 0.0 : (marksObtained * 100.0) / totalMarks;
        boolean passed = percentage >= PASS_PERCENTAGE;

        Result result = new Result();
        result.setUser(user);
        result.setQuiz(quiz);
        result.setEmail(request.getEmail());
        result.setSubject(quiz.getSubject());
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correct);
        result.setWrongAnswers(totalQuestions - correct);
        result.setMarksObtained(marksObtained);
        result.setPercentage(Math.round(percentage * 100.0) / 100.0);
        result.setPassed(passed);
        result.setTimeTakenSeconds(request.getTimeTakenSeconds() == null ? 0L : request.getTimeTakenSeconds());
        result.setSubmissionTime(LocalDateTime.now());
        result.setPublished(false);

        Result saved = resultRepository.save(result);

        // Lock this quiz for this user now that they've attempted it.
        quizAccessService.lockAfterAttempt(user, quiz);

        // Score stays hidden immediately after submit too — the user only sees a
        // "submitted successfully, pending review" state until admin publishes it.
        return toResponse(saved, totalMarks, true);
    }

    /** For a user viewing one of their own results. Score fields are hidden unless published. */
    public ResultResponse getResultForUser(Long id, String requesterEmail) {
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + id));

        if (!result.getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new UnauthorizedException("You are not allowed to view this result");
        }

        int totalMarks = result.getQuiz() != null ? result.getQuiz().getTotalMarks() : result.getMarksObtained();
        boolean mask = !result.isPublished();
        return toResponse(result, totalMarks, mask);
    }

    /** For admin — always full detail, regardless of published state. */
    public ResultResponse getResultById(Long id) {
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + id));
        int totalMarks = result.getQuiz() != null ? result.getQuiz().getTotalMarks() : result.getMarksObtained();
        return toResponse(result, totalMarks, false);
    }

    /** List of a user's own past attempts, most recent first. Scores masked unless published. */
    public List<ResultResponse> getMyResults(String email) {
        return resultRepository.findByEmailOrderBySubmissionTimeDesc(email).stream()
                .map(r -> {
                    int totalMarks = r.getQuiz() != null ? r.getQuiz().getTotalMarks() : r.getMarksObtained();
                    return toResponse(r, totalMarks, !r.isPublished());
                })
                .toList();
    }

    public PageResponse<ResultResponse> getAllResults(String search, int page, int size) {
        String s = search == null ? "" : search;
        Page<Result> resultPage = resultRepository
                .findByEmailContainingIgnoreCaseOrSubjectContainingIgnoreCase(s, s, PageRequest.of(page, size));

        var content = resultPage.getContent().stream()
                .map(r -> toResponse(r, r.getQuiz() != null ? r.getQuiz().getTotalMarks() : r.getMarksObtained(), false))
                .toList();

        return new PageResponse<>(content, resultPage.getNumber(), resultPage.getSize(),
                resultPage.getTotalElements(), resultPage.getTotalPages());
    }

    public void deleteResult(Long id) {
        if (!resultRepository.existsById(id)) {
            throw new ResourceNotFoundException("Result not found with id: " + id);
        }
        resultRepository.deleteById(id);
    }

    public void setPublished(Long id, boolean published) {
        Result result = resultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Result not found with id: " + id));
        result.setPublished(published);
        resultRepository.save(result);
    }

    private ResultResponse toResponse(Result r, int totalMarks, boolean mask) {
        Long quizId = r.getQuiz() != null ? r.getQuiz().getId() : null;

        boolean locked = false;
        Long lockId = null;
        if (quizId != null) {
            var lockOpt = quizAccessService.findLock(r.getEmail(), quizId);
            if (lockOpt.isPresent()) {
                QuizAttemptLock lock = lockOpt.get();
                locked = lock.isLocked();
                lockId = lock.getId();
            }
        }

        if (mask) {
            // Hide score-related fields until the admin publishes this result.
            return new ResultResponse(r.getId(), r.getEmail(), r.getSubject(), quizId, r.getTotalQuestions(),
                    null, null, null, totalMarks,
                    null, null, r.getTimeTakenSeconds(), r.getSubmissionTime(),
                    locked, lockId, false);
        }

        return new ResultResponse(r.getId(), r.getEmail(), r.getSubject(), quizId, r.getTotalQuestions(),
                r.getCorrectAnswers(), r.getWrongAnswers(), r.getMarksObtained(), totalMarks,
                r.getPercentage(), r.getPassed(), r.getTimeTakenSeconds(), r.getSubmissionTime(),
                locked, lockId, r.isPublished());
    }
}
