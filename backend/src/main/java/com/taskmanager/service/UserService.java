package com.taskmanager.service;

import com.taskmanager.dto.*;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

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

    @Transactional
    public User updateProfile(User currentUser, Map<String, String> updates) {
        String fullName = updates.get("fullName");
        String username = updates.get("username");
        String email = updates.get("email");
        String currentPassword = updates.get("currentPassword");
        String newPassword = updates.get("newPassword");

        if (fullName != null && !fullName.isBlank())
            currentUser.setFullName(fullName);

        if (username != null && !username.isBlank() &&
                !username.equals(currentUser.getUsername())) {
            if (userRepository.existsByUsername(username))
                throw new RuntimeException("Username already taken");
            currentUser.setUsername(username);
        }

        if (email != null && !email.isBlank() &&
                !email.equals(currentUser.getEmail())) {
            if (userRepository.existsByEmail(email))
                throw new RuntimeException("Email already in use");
            currentUser.setEmail(email);
        }

        if (newPassword != null && !newPassword.isBlank()) {
            if (currentPassword == null ||
                    !passwordEncoder.matches(currentPassword, currentUser.getPassword()))
                throw new RuntimeException("Current password is incorrect");
            if (newPassword.length() < 6)
                throw new RuntimeException("New password must be at least 6 characters");
            currentUser.setPassword(passwordEncoder.encode(newPassword));
        }

        return userRepository.save(currentUser);
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