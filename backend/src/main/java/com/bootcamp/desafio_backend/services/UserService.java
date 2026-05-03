package com.bootcamp.desafio_backend.services;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PreferenceRepository preferenceRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final ActivityTypeRepository activityTypeRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;

    public UserService(UserRepository userRepository,
                       PreferenceRepository preferenceRepository,
                       UserAchievementRepository userAchievementRepository,
                       ActivityTypeRepository activityTypeRepository,
                       PasswordEncoder passwordEncoder,
                       StorageService storageService) {
        this.userRepository = userRepository;
        this.preferenceRepository = preferenceRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.activityTypeRepository = activityTypeRepository;
        this.passwordEncoder = passwordEncoder;
        this.storageService = storageService;
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
    public void definePreferences(UUID userId, List<UUID> activityTypeIds) {
        if (activityTypeIds == null || activityTypeIds.isEmpty()) {
            throw new BusinessException(ErrorCode.E1);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

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

        String avatarUrl = storageService.uploadImage(file, "avatars");
        user.setAvatar(avatarUrl);
        userRepository.save(user);
        return new AvatarResponse(avatarUrl);
    }

    @Transactional
    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        if (StringUtils.hasText(request.email())
                && !user.getEmail().equals(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.E3);
        }

        if (StringUtils.hasText(request.name())) {
            user.setName(request.name());
        }

        if (StringUtils.hasText(request.email())) {
            user.setEmail(request.email());
        }

        if (StringUtils.hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

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
