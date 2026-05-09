package com.taskmanager.controller;

import com.taskmanager.config.JwtUtil;
import com.taskmanager.dto.*;
import com.taskmanager.model.User;
import com.taskmanager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request);
        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(
                token, user.getId(), user.getUsername(),
                user.getEmail(), user.getFullName(),
                user.getRole().name(), user.getAvatarColor()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        User user = userService.findByEmailOrUsername(request.getIdentifier());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(
                token, user.getId(), user.getUsername(),
                user.getEmail(), user.getFullName(),
                user.getRole().name(), user.getAvatarColor()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        User user = userService.findByEmailOrUsername(email);
        return ResponseEntity.ok(userService.toDTO(user));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}