package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.RegisterRequest;
import com.bootcamp.desafio_backend.dtos.request.SignInRequest;
import com.bootcamp.desafio_backend.dtos.response.AuthResponse;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import com.bootcamp.desafio_backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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

    private User activeUser;

    @BeforeEach
    void setUp() {
        activeUser = new User();
        activeUser.setId(UUID.randomUUID());
        activeUser.setName("Test User");
        activeUser.setEmail("test@test.com");
        activeUser.setCpf("12345678901");
        activeUser.setPassword("encoded-password");
        activeUser.setXp(0);
        activeUser.setLevel(1);
    }

    @Test
    void register_Success() {
        RegisterRequest request = new RegisterRequest("Test User", "test@test.com", "12345678901", "123456");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.existsByCpf(request.cpf())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(activeUser);
        when(jwtService.generateToken(activeUser)).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        assertEquals(activeUser.getEmail(), response.user().email());
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals(
                "https://t4.ftcdn.net/jpg/02/29/75/83/360_F_229758328_7x8jwCwjtBMmC6rgFzLFhZoEpLobB6L8.jpg",
                captor.getValue().getAvatar()
        );
        verify(passwordEncoder).encode(request.password());
        verify(jwtService).generateToken(activeUser);
    }

    @Test
    void register_WithFormattedCpf_NormalizesCpfBeforeSaving() {
        RegisterRequest request = new RegisterRequest("Test User", "test@test.com", "123.456.789-01", "123456");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.existsByCpf("12345678901")).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(activeUser);
        when(jwtService.generateToken(activeUser)).thenReturn("jwt-token");

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).existsByCpf("12345678901");
        verify(userRepository).save(captor.capture());
        assertEquals("12345678901", captor.getValue().getCpf());
    }

    @Test
    void register_DuplicateEmail_ThrowsConflict() {
        RegisterRequest request = new RegisterRequest("Test User", "test@test.com", "12345678901", "123456");

        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.register(request));

        assertEquals(ErrorCode.E3, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_DuplicateCpf_ThrowsConflict() {
        RegisterRequest request = new RegisterRequest("Test User", "test@test.com", "12345678901", "123456");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.existsByCpf(request.cpf())).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.register(request));

        assertEquals(ErrorCode.E3, exception.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void signIn_Success() {
        SignInRequest request = new SignInRequest("test@test.com", "123456");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches(request.password(), activeUser.getPassword())).thenReturn(true);
        when(jwtService.generateToken(activeUser)).thenReturn("jwt-token");

        AuthResponse response = authService.signIn(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.token());
        assertEquals(activeUser.getEmail(), response.user().email());
    }

    @Test
    void signIn_UserNotFound_ThrowsNotFound() {
        SignInRequest request = new SignInRequest("missing@test.com", "123456");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.signIn(request));

        assertEquals(ErrorCode.E4, exception.getErrorCode());
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    void signIn_WrongPassword_ThrowsUnauthorized() {
        SignInRequest request = new SignInRequest("test@test.com", "wrong-password");

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches(request.password(), activeUser.getPassword())).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class, () -> authService.signIn(request));

        assertEquals(ErrorCode.E5, exception.getErrorCode());
        verify(jwtService, never()).generateToken(activeUser);
    }

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
