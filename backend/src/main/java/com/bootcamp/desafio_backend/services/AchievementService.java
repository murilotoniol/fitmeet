package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.enums.ParticipationStatus;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.models.UserAchievement;
import com.bootcamp.desafio_backend.repositories.AchievementRepository;
import com.bootcamp.desafio_backend.repositories.ActivityParticipantRepository;
import com.bootcamp.desafio_backend.repositories.UserAchievementRepository;
import org.springframework.stereotype.Service;

@Service
public class AchievementService {

    private static final String ACHIEVEMENT_FIRST_CHECK_IN = "Primeiro Check-in";
    private static final String ACHIEVEMENT_FIRST_TECH_CHECK_IN = "Primeiro check-in em tecnologia";
    private static final String ACHIEVEMENT_FIRST_ACTIVITY_CREATED = "Primeira atividade criada";
    private static final String ACHIEVEMENT_FIRST_ACTIVITY_COMPLETED = "Primeira atividade conclu\u00edda";
    private static final String ACHIEVEMENT_LEVEL_7 = "Alcan\u00e7ou level 7";
    private static final String ACHIEVEMENT_LEVEL_77 = "Alcan\u00e7ou level 77";
    private static final String ACHIEVEMENT_LEVEL_100 = "Alcan\u00e7ou level 100";
    private static final String ACHIEVEMENT_PARTICIPATE_5 = "Participou de 5 atividades";
    private static final String ACHIEVEMENT_PARTICIPATE_10 = "Participou de 10 atividades";

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;
    private final ActivityParticipantRepository activityParticipantRepository;

    public AchievementService(AchievementRepository achievementRepository,
                              UserAchievementRepository userAchievementRepository,
                              ActivityParticipantRepository activityParticipantRepository) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
        this.activityParticipantRepository = activityParticipantRepository;
    }

    public void grantFirstCheckIn(User user) {
        grantAchievementIfExists(user, ACHIEVEMENT_FIRST_CHECK_IN);
    }

    public void grantFirstTechCheckIn(User user) {
        grantAchievementIfExists(user, ACHIEVEMENT_FIRST_TECH_CHECK_IN);
    }

    public void grantFirstActivityCreated(User user) {
        grantAchievementIfExists(user, ACHIEVEMENT_FIRST_ACTIVITY_CREATED);
    }

    public void grantFirstActivityCompleted(User user) {
        grantAchievementIfExists(user, ACHIEVEMENT_FIRST_ACTIVITY_COMPLETED);
    }

    public void grantLevelAchievements(User user) {
        if (user.getLevel() >= 7) {
            grantAchievementIfExists(user, ACHIEVEMENT_LEVEL_7);
        }

        if (user.getLevel() >= 77) {
            grantAchievementIfExists(user, ACHIEVEMENT_LEVEL_77);
        }

        if (user.getLevel() >= 100) {
            grantAchievementIfExists(user, ACHIEVEMENT_LEVEL_100);
        }
    }

    public void grantParticipationAchievements(User user) {
        long checkInCount = activityParticipantRepository.countByUserIdAndStatus(
                user.getId(),
                ParticipationStatus.CHECKED_IN
        );

        if (checkInCount >= 5) {
            grantAchievementIfExists(user, ACHIEVEMENT_PARTICIPATE_5);
        }

        if (checkInCount >= 10) {
            grantAchievementIfExists(user, ACHIEVEMENT_PARTICIPATE_10);
        }
    }

    private void grantAchievementIfExists(User user, String achievementName) {
        achievementRepository.findByName(achievementName).ifPresent(achievement -> {
            boolean alreadyGranted = userAchievementRepository.existsByUserIdAndAchievementId(
                    user.getId(),
                    achievement.getId()
            );

            if (!alreadyGranted) {
                UserAchievement userAchievement = new UserAchievement();
                userAchievement.setUser(user);
                userAchievement.setAchievement(achievement);
                userAchievementRepository.save(userAchievement);
            }
        });
    }
}
