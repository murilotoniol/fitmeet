package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.dtos.request.DefinePreferencesRequest;
import com.bootcamp.desafio_backend.dtos.request.UpdateUserRequest;
import com.bootcamp.desafio_backend.dtos.response.AchievementResponse;
import com.bootcamp.desafio_backend.dtos.response.AvatarResponse;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.PreferenceResponse;
import com.bootcamp.desafio_backend.dtos.response.UserProfileResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.security.UserDetailsImpl;
import com.bootcamp.desafio_backend.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UUID userId;
    private UserDetailsImpl userDetails;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        user.setName("Test User");
        user.setEmail("test@test.com");
        user.setCpf("12345678901");

        userDetails = new UserDetailsImpl(user);
    }

    @Test
    void getUser_ReturnsOk() {
        UserProfileResponse profileResponse = new UserProfileResponse(
                userId,
                "Test User",
                "test@test.com",
                "12345678901",
                null,
                10,
                1,
                List.of(new AchievementResponse(UUID.randomUUID(), "Primeiro Passo", "Primeira atividade"))
        );

        when(userService.getUserProfile(userId)).thenReturn(profileResponse);

        ResponseEntity<UserProfileResponse> response = userController.getUser(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test User", response.getBody().name());
        verify(userService).getUserProfile(userId);
    }

    @Test
    void getUserPreferences_ReturnsOk() {
        List<PreferenceResponse> preferences = List.of(
                new PreferenceResponse(UUID.randomUUID(), "Esporte", "Atividades esportivas")
        );

        when(userService.getUserPreferences(userId)).thenReturn(preferences);

        ResponseEntity<List<PreferenceResponse>> response = userController.getUserPreferences(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(userService).getUserPreferences(userId);
    }

    @Test
    void definePreferences_ReturnsOk() {
        DefinePreferencesRequest request = new DefinePreferencesRequest(List.of(UUID.randomUUID()));

        ResponseEntity<MessageResponse> response = userController.definePreferences(userDetails, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Preferencias atualizadas com sucesso", response.getBody().message());
        verify(userService).definePreferences(userId, request);
    }

    @Test
    void updateAvatar_ReturnsOk() {
        MockMultipartFile file = new MockMultipartFile("avatar", "avatar.png", "image/png", "image-data".getBytes());
        AvatarResponse avatarResponse = new AvatarResponse("data:image/png;base64,abc");

        when(userService.updateAvatar(userId, file)).thenReturn(avatarResponse);

        ResponseEntity<AvatarResponse> response = userController.updateAvatar(userDetails, file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("data:image/png;base64,abc", response.getBody().avatar());
        verify(userService).updateAvatar(userId, file);
    }

    @Test
    void updateUser_ReturnsOk() {
        UpdateUserRequest request = new UpdateUserRequest("Updated User", "updated@test.com");
        UserResponse userResponse = new UserResponse(
                userId,
                "Updated User",
                "updated@test.com",
                "12345678901",
                null,
                10,
                1
        );

        when(userService.updateUser(userId, request)).thenReturn(userResponse);

        ResponseEntity<UserResponse> response = userController.updateUser(userDetails, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Updated User", response.getBody().name());
        verify(userService).updateUser(userId, request);
    }

    @Test
    void deactivateUser_ReturnsOk() {
        ResponseEntity<MessageResponse> response = userController.deactivateUser(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Conta desativada com sucesso", response.getBody().message());
        verify(userService).deactivateUser(userId);
    }
}
