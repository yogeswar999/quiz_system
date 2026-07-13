package com.quizapp.repository;

import com.quizapp.entity.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Page<Quiz> findBySubjectContainingIgnoreCase(String subject, Pageable pageable);
}
