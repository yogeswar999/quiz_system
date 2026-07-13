package com.quizapp.service;

import com.quizapp.entity.Quiz;
import com.quizapp.entity.QuizAttemptLock;
import com.quizapp.entity.User;
import com.quizapp.exception.QuizLockedException;
import com.quizapp.exception.ResourceNotFoundException;
import com.quizapp.repository.QuizAttemptLockRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class QuizAccessService {

    private final QuizAttemptLockRepository lockRepository;

    public QuizAccessService(QuizAttemptLockRepository lockRepository) {
        this.lockRepository = lockRepository;
    }

    public Optional<QuizAttemptLock> findLock(String email, Long quizId) {
        return lockRepository.findByUserEmailAndQuizId(email, quizId);
    }

    public boolean isLocked(String email, Long quizId) {
        return findLock(email, quizId).map(QuizAttemptLock::isLocked).orElse(false);
    }

    public void assertNotLocked(String email, Long quizId) {
        if (isLocked(email, quizId)) {
            throw new QuizLockedException(
                    "You have already attempted this quiz. Please contact the admin to unlock it before retaking.");
        }
    }

    /** Called right after a user submits a result — locks them out of retaking this quiz. */
    public void lockAfterAttempt(User user, Quiz quiz) {
        QuizAttemptLock lock = lockRepository.findByUserEmailAndQuizId(user.getEmail(), quiz.getId())
                .orElseGet(() -> {
                    QuizAttemptLock newLock = new QuizAttemptLock();
                    newLock.setUser(user);
                    newLock.setQuiz(quiz);
                    return newLock;
                });

        lock.setLocked(true);
        lock.setLockedAt(LocalDateTime.now());
        lock.setUnlockedAt(null);
        lockRepository.save(lock);
    }

    /** Admin action — allows the user to retake this quiz once. */
    public void unlock(Long lockId) {
        QuizAttemptLock lock = lockRepository.findById(lockId)
                .orElseThrow(() -> new ResourceNotFoundException("Lock record not found with id: " + lockId));

        lock.setLocked(false);
        lock.setUnlockedAt(LocalDateTime.now());
        lockRepository.save(lock);
    }
}
