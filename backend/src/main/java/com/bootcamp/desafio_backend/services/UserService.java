package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.DefinePreferencesRequest;
import com.bootcamp.desafio_backend.dtos.request.UpdateUserRequest;
import com.bootcamp.desafio_backend.dtos.response.AchievementResponse;
import com.bootcamp.desafio_backend.dtos.response.AvatarResponse;
import com.bootcamp.desafio_backend.dtos.response.PreferenceResponse;
import com.bootcamp.desafio_backend.dtos.response.UserProfileResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.ActivityType;
import com.bootcamp.desafio_backend.models.Preference;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.models.UserAchievement;
import com.bootcamp.desafio_backend.repositories.ActivityTypeRepository;
import com.bootcamp.desafio_backend.repositories.PreferenceRepository;
import com.bootcamp.desafio_backend.repositories.UserAchievementRepository;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final ActivityTypeRepository activityTypeRepository;

    public UserService(UserRepository userRepository,
                       PreferenceRepository preferenceRepository,
                       UserAchievementRepository userAchievementRepository,
                       ActivityTypeRepository activityTypeRepository) {
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.activityTypeRepository = activityTypeRepository;
    }

    public UserProfileResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);

        List<AchievementResponse> achievements = userAchievements.stream()
                .map(ua -> new AchievementResponse(
                        ua.getAchievement().getId(),
                        ua.getAchievement().getName(),
                        ua.getAchievement().getCriterion()
                ))
                .toList();

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCpf(),
                user.getAvatar(),
                user.getXp(),
                user.getLevel(),
                achievements
        );
    }

    public List<PreferenceResponse> getUserPreferences(UUID userId) {
        List<Preference> preferences = preferenceRepository.findByUserId(userId);

        return preferences.stream()
                .map(p -> new PreferenceResponse(
                        p.getType().getId(),
                        p.getType().getName(),
                        p.getType().getDescription()
                ))
                .toList();
    }

    @Transactional
    public void definePreferences(UUID userId, DefinePreferencesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        List<UUID> activityTypeIds = request.activityTypeIds();
        List<ActivityType> types = activityTypeRepository.findAllById(activityTypeIds);
        if (types.size() != activityTypeIds.size()) {
            throw new BusinessException(ErrorCode.E1);
        }

        preferenceRepository.deleteByUserId(userId);

        List<Preference> newPreferences = types.stream()
                .map(type -> {
                    Preference preference = new Preference();
                    preference.setUser(user);
                    preference.setType(type);
                    return preference;
                })
                .toList();

        preferenceRepository.saveAll(newPreferences);
    }

    public AvatarResponse updateAvatar(UUID userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException(ErrorCode.E2);
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
            throw new BusinessException(ErrorCode.E2);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        try {
            String base64Avatar = Base64.getEncoder().encodeToString(file.getBytes());
            String avatarData = "data:" + contentType + ";base64," + base64Avatar;
            user.setAvatar(avatarData);
            userRepository.save(user);
            return new AvatarResponse(avatarData);
        } catch (Exception e) {
            throw new RuntimeException("Erro inesperado", e);
        }
    }

    @Transactional
    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.E3);
        }

        user.setName(request.name());
        user.setEmail(request.email());

        User updatedUser = userRepository.save(user);

        return new UserResponse(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getCpf(),
                updatedUser.getAvatar(),
                updatedUser.getXp(),
                updatedUser.getLevel()
        );
    }

    @Transactional
    public void deactivateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        user.setDeletedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }
}
