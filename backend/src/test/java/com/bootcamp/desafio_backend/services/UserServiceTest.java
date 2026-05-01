package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.DefinePreferencesRequest;
import com.bootcamp.desafio_backend.dtos.request.UpdateUserRequest;
import com.bootcamp.desafio_backend.dtos.response.AvatarResponse;
import com.bootcamp.desafio_backend.dtos.response.PreferenceResponse;
import com.bootcamp.desafio_backend.dtos.response.UserProfileResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.ActivityType;
import com.bootcamp.desafio_backend.models.Achievement;
import com.bootcamp.desafio_backend.models.Preference;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.models.UserAchievement;
import com.bootcamp.desafio_backend.repositories.ActivityTypeRepository;
import com.bootcamp.desafio_backend.repositories.PreferenceRepository;
import com.bootcamp.desafio_backend.repositories.UserAchievementRepository;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PreferenceRepository preferenceRepository;
    @Mock
    private UserAchievementRepository userAchievementRepository;
    @Mock
    private ActivityTypeRepository activityTypeRepository;

    @InjectMocks
    private UserService userService;

    private User mockUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        mockUser = new User();
        mockUser.setId(userId);
        mockUser.setName("Test User");
        mockUser.setEmail("test@test.com");
        mockUser.setCpf("12345678901");
        mockUser.setXp(100);
        mockUser.setLevel(2);
    }

    @Test
    void getUserProfile_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        
        Achievement achievement = new Achievement();
        achievement.setId(UUID.randomUUID());
        achievement.setName("Primeiro Passo");
        achievement.setCriterion("Primeira atividade");
        
        UserAchievement userAchievement = new UserAchievement();
        userAchievement.setAchievement(achievement);
        userAchievement.setUser(mockUser);
        
        when(userAchievementRepository.findByUserId(userId)).thenReturn(List.of(userAchievement));

        UserProfileResponse response = userService.getUserProfile(userId);

        assertNotNull(response);
        assertEquals("Test User", response.name());
        assertEquals(1, response.achievements().size());
        assertEquals("Primeiro Passo", response.achievements().get(0).name());
    }

    @Test
    void getUserProfile_UserNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> userService.getUserProfile(userId));
        assertEquals(ErrorCode.E4, exception.getErrorCode());
    }

    @Test
    void getUserPreferences_Success() {
        ActivityType type = new ActivityType();
        type.setId(UUID.randomUUID());
        type.setName("Esporte");
        type.setDescription("Atividades esportivas");

        Preference preference = new Preference();
        preference.setType(type);
        preference.setUser(mockUser);

        when(preferenceRepository.findByUserId(userId)).thenReturn(List.of(preference));

        List<PreferenceResponse> responses = userService.getUserPreferences(userId);

        assertEquals(1, responses.size());
        assertEquals("Esporte", responses.get(0).typeName());
    }

    @Test
    void definePreferences_Success() {
        UUID typeId = UUID.randomUUID();
        List<UUID> typeIds = List.of(typeId);
        ActivityType type = new ActivityType();
        type.setId(typeId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(activityTypeRepository.findAllById(typeIds)).thenReturn(List.of(type));

        userService.definePreferences(userId, new DefinePreferencesRequest(typeIds));

        verify(preferenceRepository).deleteByUserId(userId);
        verify(preferenceRepository).saveAll(anyList());
    }

    @Test
    void definePreferences_InvalidActivityTypes() {
        UUID typeId = UUID.randomUUID();
        List<UUID> typeIds = List.of(typeId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(activityTypeRepository.findAllById(typeIds)).thenReturn(List.of()); // Not found

        BusinessException exception = assertThrows(BusinessException.class, () ->
                userService.definePreferences(userId, new DefinePreferencesRequest(typeIds)));
        assertEquals(ErrorCode.E1, exception.getErrorCode());
        
        verify(preferenceRepository, never()).deleteByUserId(any());
        verify(preferenceRepository, never()).saveAll(any());
    }

    @Test
    void updateAvatar_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", "dummy image data".getBytes());
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        AvatarResponse response = userService.updateAvatar(userId, file);

        assertNotNull(response);
        assertTrue(response.avatar().startsWith("data:image/png;base64,"));
        verify(userRepository).save(mockUser);
    }

    @Test
    void updateAvatar_InvalidFormat() {
        MockMultipartFile file = new MockMultipartFile("file", "document.pdf", "application/pdf", "dummy data".getBytes());
        
        BusinessException exception = assertThrows(BusinessException.class, () -> userService.updateAvatar(userId, file));
        assertEquals(ErrorCode.E2, exception.getErrorCode());
    }

    @Test
    void updateUser_Success() {
        UpdateUserRequest request = new UpdateUserRequest("Updated Name", "updated@test.com");
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateUser(userId, request);

        assertEquals("Updated Name", response.name());
        assertEquals("updated@test.com", response.email());
        verify(userRepository).save(mockUser);
    }

    @Test
    void updateUser_EmailAlreadyInUse() {
        UpdateUserRequest request = new UpdateUserRequest("Updated Name", "existing@test.com");
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> userService.updateUser(userId, request));
        assertEquals(ErrorCode.E3, exception.getErrorCode());
        
        verify(userRepository, never()).save(any());
    }

    @Test
    void deactivateUser_Success() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.deactivateUser(userId);

        assertNotNull(mockUser.getDeletedAt());
        verify(userRepository).save(mockUser);
    }
}
