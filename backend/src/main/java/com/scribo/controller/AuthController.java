package com.scribo.controller;

import com.scribo.model.User;
import com.scribo.repository.UserRepository;
import com.scribo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        if (userRepo.existsByUsername(body.get("username"))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken."));
        }
        User user = new User();
        user.setUsername(body.get("username"));
        user.setPassword(encoder.encode(body.get("password")));
        userRepo.save(user);
        return ResponseEntity.ok(Map.of("message", "Account created."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        return userRepo.findByUsername(body.get("username"))
            .filter(u -> encoder.matches(body.get("password"), u.getPassword()))
            .map(u -> ResponseEntity.ok(Map.of(
                "token", jwtUtil.generate(u.getUsername()),
                "username", u.getUsername()
            )))
            .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid credentials.")));
    }
}
