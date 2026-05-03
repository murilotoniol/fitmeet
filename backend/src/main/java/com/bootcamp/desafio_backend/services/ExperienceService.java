package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class ExperienceService {

    private static final int BASE_XP_TO_LEVEL_UP = 100;
    private static final double LEVEL_XP_MULTIPLIER = 1.08;
    private static final int PARTICIPANT_CHECK_IN_XP = 25;
    private static final int CREATOR_CHECK_IN_XP = 5;

    private final UserRepository userRepository;
    private final AchievementService achievementService;

    public ExperienceService(UserRepository userRepository,
                             AchievementService achievementService) {
        this.userRepository = userRepository;
        this.achievementService = achievementService;
    }

    public void applyCheckInExperience(User participant, User creator) {
        applyXpAndRefreshLevel(participant, PARTICIPANT_CHECK_IN_XP);
        applyXpAndRefreshLevel(creator, CREATOR_CHECK_IN_XP);
    }

    private void applyXpAndRefreshLevel(User user, int xpGain) {
        int updatedXp = user.getXp() + xpGain;
        user.setXp(updatedXp);
        user.setLevel(calculateLevelFromXp(updatedXp));
        userRepository.save(user);
        achievementService.grantLevelAchievements(user);
    }

    private int calculateLevelFromXp(int totalXp) {
        int calculatedLevel = 1;
        int remainingXp = totalXp;

        while (remainingXp >= xpRequiredForNextLevel(calculatedLevel)) {
            remainingXp -= xpRequiredForNextLevel(calculatedLevel);
            calculatedLevel++;
        }

        return calculatedLevel;
    }

    private int xpRequiredForNextLevel(int currentLevel) {
        double multiplierPower = Math.pow(LEVEL_XP_MULTIPLIER, currentLevel - 1);
        return (int) Math.ceil(BASE_XP_TO_LEVEL_UP * multiplierPower);
    }
}
