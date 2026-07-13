package com.quizapp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempt_locks", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "quiz_id"}))
@Data
public class QuizAttemptLock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    /** true = user cannot retake this quiz until an admin unlocks it. */
    @Column(nullable = false)
    private boolean locked = true;

    private LocalDateTime lockedAt;

    private LocalDateTime unlockedAt;
}
