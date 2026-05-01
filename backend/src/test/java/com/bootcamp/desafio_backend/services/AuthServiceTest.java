package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.SignInRequest;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import com.bootcamp.desafio_backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void signIn_InactiveUser_ThrowsForbidden() {
        User user = new User();
        user.setEmail("inactive@test.com");
        user.setPassword("encoded");
        user.setDeletedAt(LocalDateTime.now());

        when(userRepository.findByEmail("inactive@test.com")).thenReturn(Optional.of(user));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                authService.signIn(new SignInRequest("inactive@test.com", "123456")));

        assertEquals(ErrorCode.E6, exception.getErrorCode());
        verify(passwordEncoder, never()).matches("123456", "encoded");
        verify(jwtService, never()).generateToken(user);
    }
}
