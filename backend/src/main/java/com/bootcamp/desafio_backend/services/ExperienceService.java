package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ExperienceService {

    private final UserRepository userRepository;
    private final AchievementService achievementService;
    private final int baseXpToLevelUp;
    private final double levelXpMultiplier;
    private final int participantCheckInXp;
    private final int creatorCheckInXp;

    public ExperienceService(UserRepository userRepository,
                             AchievementService achievementService,
                             @Value("${experience.level.base-xp-to-level-up:100}") int baseXpToLevelUp,
                             @Value("${experience.level.multiplier:1.08}") double levelXpMultiplier,
                             @Value("${experience.check-in.participant-xp:25}") int participantCheckInXp,
                             @Value("${experience.check-in.creator-xp:5}") int creatorCheckInXp) {
        this.userRepository = userRepository;
        this.achievementService = achievementService;
        this.baseXpToLevelUp = baseXpToLevelUp;
        this.levelXpMultiplier = levelXpMultiplier;
        this.participantCheckInXp = participantCheckInXp;
        this.creatorCheckInXp = creatorCheckInXp;
    }

    public void applyCheckInExperience(User participant, User creator) {
        applyXpAndRefreshLevel(participant, participantCheckInXp);
        applyXpAndRefreshLevel(creator, creatorCheckInXp);
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
        double multiplierPower = Math.pow(levelXpMultiplier, currentLevel - 1);
        return (int) Math.ceil(baseXpToLevelUp * multiplierPower);
    }
}
