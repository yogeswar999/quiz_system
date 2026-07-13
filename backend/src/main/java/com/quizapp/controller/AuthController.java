package com.quizapp.controller;

import com.quizapp.dto.request.AdminLoginRequest;
import com.quizapp.dto.request.RegisterRequest;
import com.quizapp.dto.request.UserLoginRequest;
import com.quizapp.dto.response.ApiResponse;
import com.quizapp.dto.response.AuthResponse;
import com.quizapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/admin/login")
    public ApiResponse<AuthResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        return ApiResponse.ok("Login successful", authService.adminLogin(request));
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Registration successful", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody UserLoginRequest request) {
        return ApiResponse.ok("Login successful", authService.login(request));
    }
}
