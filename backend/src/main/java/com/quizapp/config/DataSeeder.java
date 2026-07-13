package com.quizapp.config;

import com.quizapp.entity.Admin;
import com.quizapp.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-admin.username}")
    private String defaultUsername;

    @Value("${app.default-admin.password}")
    private String defaultPassword;

    public DataSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (adminRepository.findByUsername(defaultUsername).isEmpty()) {
            Admin admin = new Admin();
            admin.setUsername(defaultUsername);
            admin.setPassword(passwordEncoder.encode(defaultPassword));
            adminRepository.save(admin);
            System.out.println("Seeded default admin -> username: " + defaultUsername + " / password: " + defaultPassword);
        }
    }
}
