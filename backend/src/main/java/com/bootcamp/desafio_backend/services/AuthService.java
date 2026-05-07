package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.RegisterRequest;
import com.bootcamp.desafio_backend.dtos.request.SignInRequest;
import com.bootcamp.desafio_backend.dtos.response.AuthResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.UserRepository;

import com.bootcamp.desafio_backend.security.JwtService;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final String DEFAULT_AVATAR_URL = "https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCpf(),
                user.getAvatar(),
                user.getXp(),
                user.getLevel()
        );
    }

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedCpf = normalizeCpf(request.cpf());

        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.E3);
        }

        if (userRepository.existsByCpf(normalizedCpf)) {
            throw new BusinessException(ErrorCode.E3);
        }

        User newUser = new User();
        newUser.setName(request.name());
        newUser.setEmail(request.email());
        newUser.setCpf(normalizedCpf);
        newUser.setPassword(passwordEncoder.encode(request.password()));
        newUser.setAvatar(DEFAULT_AVATAR_URL);

        User savedUser = userRepository.save(newUser);

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(token, toUserResponse(savedUser));
    }

    private String normalizeCpf(String cpf) {
        return cpf.replaceAll("\\D", "");
    }

    public AuthResponse signIn(SignInRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.E6);
        }

        boolean passwordMatches = passwordEncoder.matches(request.password(), user.getPassword());

        if (!passwordMatches) {
            throw new BusinessException(ErrorCode.E5);
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, toUserResponse(user));
    }
}
