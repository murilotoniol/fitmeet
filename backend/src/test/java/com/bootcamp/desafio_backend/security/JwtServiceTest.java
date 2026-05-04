package com.bootcamp.desafio_backend.security;

import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "test-secret-with-enough-length");
        ReflectionTestUtils.setField(jwtService, "expiration", 86_400_000L);

        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@test.com");
    }

    @Test
    void generateToken_ReturnsTokenAndExtractSubjectReadsEmail() {
        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertEquals(user.getEmail(), jwtService.extractSubject(token));
    }

    @Test
    void extractSubject_WithInvalidToken_ThrowsBusinessException() {
        assertThrows(BusinessException.class, () -> jwtService.extractSubject("invalid-token"));
    }

    @Test
    void isTokenValid_WhenSubjectMatchesUser_ReturnsTrue() {
        String token = jwtService.generateToken(user);

        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValid_WhenSubjectDoesNotMatchUser_ReturnsFalse() {
        String token = jwtService.generateToken(user);

        User anotherUser = new User();
        anotherUser.setEmail("another@test.com");

        assertFalse(jwtService.isTokenValid(token, anotherUser));
    }

    @Test
    void isTokenValid_WithInvalidToken_ReturnsFalse() {
        assertFalse(jwtService.isTokenValid("invalid-token", user));
    }
}
