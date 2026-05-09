package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailOrUsername(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    public User register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already in use");
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken");

        User user = new User();
        user.setFullName(req.getFullName());
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));

        if (req.getRole() != null && req.getRole().equalsIgnoreCase("ADMIN")) {
            user.setRole(User.Role.ADMIN);
        } else {
            user.setRole(User.Role.MEMBER);
        }

        return userRepository.save(user);
    }

    public User findByEmailOrUsername(String identifier) {
        return userRepository.findByEmailOrUsername(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setAvatarColor(user.getAvatarColor());
        return dto;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDTO).toList();
    }

    public User getUserFromEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}