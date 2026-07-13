package com.quizapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role; // "ADMIN" or "USER"
    private String username; // admin username or user email
}
