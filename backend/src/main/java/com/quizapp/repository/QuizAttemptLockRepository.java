package com.quizapp.repository;

import com.quizapp.entity.QuizAttemptLock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizAttemptLockRepository extends JpaRepository<QuizAttemptLock, Long> {
    Optional<QuizAttemptLock> findByUserEmailAndQuizId(String email, Long quizId);
}
