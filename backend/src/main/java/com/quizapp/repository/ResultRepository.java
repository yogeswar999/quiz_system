package com.quizapp.repository;

import com.quizapp.entity.Result;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {
    Page<Result> findByEmailContainingIgnoreCaseOrSubjectContainingIgnoreCase(
            String email, String subject, Pageable pageable);

    List<Result> findByEmailOrderBySubmissionTimeDesc(String email);
}
