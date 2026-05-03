package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.models.UserAchievement;
import com.bootcamp.desafio_backend.repositories.AchievementRepository;
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

    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    public AchievementService(AchievementRepository achievementRepository,
                              UserAchievementRepository userAchievementRepository) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
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
