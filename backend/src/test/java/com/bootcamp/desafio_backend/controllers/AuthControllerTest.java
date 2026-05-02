package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.dtos.request.RegisterRequest;
import com.bootcamp.desafio_backend.dtos.request.SignInRequest;
import com.bootcamp.desafio_backend.dtos.response.AuthResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        UserResponse userResponse = new UserResponse(
                UUID.randomUUID(),
                "Test User",
                "test@test.com",
                "12345678901",
                null,
                0,
                1
        );

        authResponse = new AuthResponse("jwt-token", userResponse);
    }

    @Test
    void register_ReturnsCreated() {
        RegisterRequest request = new RegisterRequest("Test User", "test@test.com", "12345678901", "123456");

        when(authService.register(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token", response.getBody().token());
        verify(authService).register(request);
    }

    @Test
    void signIn_ReturnsOk() {
        SignInRequest request = new SignInRequest("test@test.com", "123456");

        when(authService.signIn(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.signIn(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token", response.getBody().token());
        verify(authService).signIn(request);
    }
}
