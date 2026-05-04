package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ExperienceServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private AchievementService achievementService;

    private ExperienceService experienceService;

    @Test
    void applyCheckInExperience_AddsParticipantAndCreatorXp() {
        experienceService = buildExperienceService(100, 1.08, 25, 5);
        User participant = buildUser(0, 1);
        User creator = buildUser(0, 1);

        experienceService.applyCheckInExperience(participant, creator);

        assertEquals(25, participant.getXp());
        assertEquals(1, participant.getLevel());
        assertEquals(5, creator.getXp());
        assertEquals(1, creator.getLevel());
        verify(userRepository).save(participant);
        verify(userRepository).save(creator);
        verify(achievementService).grantLevelAchievements(participant);
        verify(achievementService).grantLevelAchievements(creator);
    }

    @Test
    void applyCheckInExperience_WhenXpCrossesThreshold_UpdatesLevels() {
        experienceService = buildExperienceService(100, 1.08, 25, 5);
        User participant = buildUser(95, 1);
        User creator = buildUser(95, 1);

        experienceService.applyCheckInExperience(participant, creator);

        assertEquals(120, participant.getXp());
        assertEquals(2, participant.getLevel());
        assertEquals(100, creator.getXp());
        assertEquals(2, creator.getLevel());
    }

    @Test
    void applyCheckInExperience_UsesConfiguredXpValues() {
        experienceService = buildExperienceService(50, 1.20, 30, 10);
        User participant = buildUser(20, 1);
        User creator = buildUser(40, 1);

        experienceService.applyCheckInExperience(participant, creator);

        assertEquals(50, participant.getXp());
        assertEquals(2, participant.getLevel());
        assertEquals(50, creator.getXp());
        assertEquals(2, creator.getLevel());
    }

    private User buildUser(int xp, int level) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setXp(xp);
        user.setLevel(level);
        return user;
    }

    private ExperienceService buildExperienceService(int baseXpToLevelUp,
                                                     double levelXpMultiplier,
                                                     int participantCheckInXp,
                                                     int creatorCheckInXp) {
        return new ExperienceService(
                userRepository,
                achievementService,
                baseXpToLevelUp,
                levelXpMultiplier,
                participantCheckInXp,
                creatorCheckInXp
        );
    }
}
