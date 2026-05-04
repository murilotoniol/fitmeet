package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.models.Achievement;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.models.UserAchievement;
import com.bootcamp.desafio_backend.repositories.AchievementRepository;
import com.bootcamp.desafio_backend.repositories.UserAchievementRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AchievementServiceTest {

    @Mock
    private AchievementRepository achievementRepository;
    @Mock
    private UserAchievementRepository userAchievementRepository;

    @InjectMocks
    private AchievementService achievementService;

    @Test
    void grantFirstCheckIn_WhenAchievementExistsAndUserDoesNotHaveIt_SavesUserAchievement() {
        User user = buildUser(1);
        Achievement achievement = buildAchievement("Primeiro Check-in");

        when(achievementRepository.findByName("Primeiro Check-in")).thenReturn(Optional.of(achievement));
        when(userAchievementRepository.existsByUserIdAndAchievementId(user.getId(), achievement.getId()))
                .thenReturn(false);

        achievementService.grantFirstCheckIn(user);

        ArgumentCaptor<UserAchievement> captor = ArgumentCaptor.forClass(UserAchievement.class);
        verify(userAchievementRepository).save(captor.capture());
        assertEquals(user, captor.getValue().getUser());
        assertEquals(achievement, captor.getValue().getAchievement());
    }

    @Test
    void grantFirstCheckIn_WhenUserAlreadyHasAchievement_DoesNotSaveAgain() {
        User user = buildUser(1);
        Achievement achievement = buildAchievement("Primeiro Check-in");

        when(achievementRepository.findByName("Primeiro Check-in")).thenReturn(Optional.of(achievement));
        when(userAchievementRepository.existsByUserIdAndAchievementId(user.getId(), achievement.getId()))
                .thenReturn(true);

        achievementService.grantFirstCheckIn(user);

        verify(userAchievementRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void grantFirstCheckIn_WhenSeedDoesNotExist_DoesNotSave() {
        User user = buildUser(1);

        when(achievementRepository.findByName("Primeiro Check-in")).thenReturn(Optional.empty());

        achievementService.grantFirstCheckIn(user);

        verify(userAchievementRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void grantLevelAchievements_WhenUserReachedLevelSeven_RequestsLevelSevenAchievement() {
        User user = buildUser(7);

        when(achievementRepository.findByName("Alcan\u00e7ou level 7")).thenReturn(Optional.empty());

        achievementService.grantLevelAchievements(user);

        verify(achievementRepository).findByName("Alcan\u00e7ou level 7");
    }

    private User buildUser(int level) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setLevel(level);
        return user;
    }

    private Achievement buildAchievement(String name) {
        Achievement achievement = new Achievement();
        achievement.setId(UUID.randomUUID());
        achievement.setName(name);
        return achievement;
    }
}
