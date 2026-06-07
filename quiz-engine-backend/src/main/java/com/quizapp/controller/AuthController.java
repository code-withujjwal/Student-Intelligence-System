package com.quizapp.controller;

import com.quizapp.dto.AuthRequestDTO;
import com.quizapp.dto.AuthResponseDTO;
import com.quizapp.dto.RegisterRequestDTO;
import com.quizapp.dto.ApiResponse;
import com.quizapp.entity.Role;
import com.quizapp.entity.UserEntity;
import com.quizapp.repository.UserRepository;
import com.quizapp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.quizapp.service.SessionService;
import com.quizapp.entity.UserSession;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final SessionService sessionService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(
            @RequestBody RegisterRequestDTO request, 
            HttpServletRequest httpServletRequest) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email already exists", "VALIDATION_ERROR"));
        }

        Role assignedRole = Role.STUDENT; // Default
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("TEACHER")) {
            assignedRole = Role.TEACHER;
        }

        UserEntity user = new UserEntity();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(assignedRole);
        
        repository.save(user);

        String jwtToken = jwtService.generateToken(user);
        
        String userAgent = httpServletRequest.getHeader("User-Agent");
        String refreshToken = sessionService.createSession(user, userAgent != null ? userAgent : "Unknown Device");
        
        return ResponseEntity.ok(ApiResponse.success(AuthResponseDTO.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .username(user.getActualUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build(), "Registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> authenticate(
            @RequestBody AuthRequestDTO request,
            HttpServletRequest httpServletRequest) {
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserEntity user = repository.findByEmail(request.getEmail())
                .orElseThrow();
        
        // Anti-tampering: Invalidate old sessions on new login (optional, but good for strict security)
        sessionService.invalidateAllUserSessions(user.getId());

        String jwtToken = jwtService.generateToken(user);
        String userAgent = httpServletRequest.getHeader("User-Agent");
        String refreshToken = sessionService.createSession(user, userAgent != null ? userAgent : "Unknown Device");
        
        return ResponseEntity.ok(ApiResponse.success(AuthResponseDTO.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .username(user.getActualUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build(), "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> refreshToken(@RequestParam String refreshToken) {
        UserSession session = sessionService.validateAndGetSession(refreshToken);
        
        if (session != null) {
            UserEntity user = repository.findById(session.getUserId()).orElse(null);
            if (user != null) {
                String newAccessToken = jwtService.generateToken(user);
                return ResponseEntity.ok(ApiResponse.success(AuthResponseDTO.builder()
                    .token(newAccessToken)
                    .refreshToken(refreshToken)
                    .username(user.getActualUsername())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build(), "Token refreshed"));
            }
        }
        return ResponseEntity.status(403).body(ApiResponse.error("Invalid or Expired Refresh Token", "AUTH_ERROR"));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam String refreshToken) {
        sessionService.invalidateSession(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}
