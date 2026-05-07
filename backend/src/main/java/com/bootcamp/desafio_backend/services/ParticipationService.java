package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.ApproveParticipantRequest;
import com.bootcamp.desafio_backend.dtos.request.CheckInRequest;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
import com.bootcamp.desafio_backend.enums.ParticipationStatus;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.Activity;
import com.bootcamp.desafio_backend.models.ActivityParticipant;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.ActivityParticipantRepository;
import com.bootcamp.desafio_backend.repositories.ActivityRepository;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ParticipationService {

    private final ActivityRepository activityRepository;
    private final ActivityParticipantRepository activityParticipantRepository;
    private final UserRepository userRepository;
    private final ExperienceService experienceService;
    private final AchievementService achievementService;
    private final ActivityQueryService activityQueryService;

    public ParticipationService(ActivityRepository activityRepository,
                                ActivityParticipantRepository activityParticipantRepository,
                                UserRepository userRepository,
                                ExperienceService experienceService,
                                AchievementService achievementService,
                                ActivityQueryService activityQueryService) {
        this.activityRepository = activityRepository;
        this.activityParticipantRepository = activityParticipantRepository;
        this.userRepository = userRepository;
        this.experienceService = experienceService;
        this.achievementService = achievementService;
        this.activityQueryService = activityQueryService;
    }

    public List<ParticipantResponse> getParticipants(UUID activityId, UUID userId) {
        Activity activity = findActiveActivityById(activityId);
        validateCreator(activity, userId, ErrorCode.E16);

        return activityParticipantRepository.findByActivityId(activityId).stream()
                .map(activityQueryService::mapToParticipantResponse)
                .toList();
    }

    @Transactional
    public MessageResponse subscribe(UUID activityId, UUID userId) {
        Activity activity = findActiveActivityById(activityId);

        if (activity.getCompletedAt() != null) {
            throw new BusinessException(ErrorCode.E12);
        }

        if (activity.getCreator().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.E8);
        }

        if (activityParticipantRepository.existsByActivityIdAndUserId(activityId, userId)) {
            throw new BusinessException(ErrorCode.E7);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        ActivityParticipant participant = new ActivityParticipant();
        participant.setActivity(activity);
        participant.setUser(user);
        participant.setApproved(!activity.isPrivate());
        participant.setStatus(activity.isPrivate() ? ParticipationStatus.PENDING : ParticipationStatus.APPROVED);
        participant.setConfirmedAt(null);
        participant.setCreatedAt(LocalDateTime.now());

        activityParticipantRepository.save(participant);
        return new MessageResponse("Inscricao realizada com sucesso");
    }

    @Transactional
    public ParticipantResponse approveParticipant(UUID activityId, ApproveParticipantRequest request, UUID userId) {
        Activity activity = findActiveActivityById(activityId);
        validateCreator(activity, userId, ErrorCode.E16);

        ActivityParticipant participant = activityParticipantRepository.findByIdAndActivityId(request.participantId(), activityId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E22));

        participant.setApproved(request.approved());
        participant.setStatus(Boolean.TRUE.equals(request.approved())
                ? ParticipationStatus.APPROVED
                : ParticipationStatus.REJECTED);
        ActivityParticipant savedParticipant = activityParticipantRepository.save(participant);
        return activityQueryService.mapToParticipantResponse(savedParticipant);
    }

    @Transactional
    public MessageResponse checkIn(UUID activityId, UUID userId, CheckInRequest request) {
        Activity activity = findActiveActivityById(activityId);

        if (activity.getCompletedAt() != null) {
            throw new BusinessException(ErrorCode.E13);
        }

        ActivityParticipant participant = activityParticipantRepository.findByActivityIdAndUserId(activityId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E9));

        if (participant.getStatus() != ParticipationStatus.APPROVED) {
            throw new BusinessException(ErrorCode.E9);
        }

        if (participant.getConfirmedAt() != null) {
            throw new BusinessException(ErrorCode.E11);
        }

        if (activity.getConfirmationCode() == null || !activity.getConfirmationCode().equals(request.confirmationCode())) {
            throw new BusinessException(ErrorCode.E10);
        }

        participant.setConfirmedAt(LocalDateTime.now());
        participant.setStatus(ParticipationStatus.CHECKED_IN);
        activityParticipantRepository.save(participant);
        experienceService.applyCheckInExperience(participant.getUser(), activity.getCreator());
        achievementService.grantFirstCheckIn(participant.getUser());

        if ("Tecnologia".equalsIgnoreCase(activity.getType().getName())) {
            achievementService.grantFirstTechCheckIn(participant.getUser());
        }

        return new MessageResponse("Check-in realizado com sucesso");
    }

    @Transactional
    public MessageResponse unsubscribe(UUID activityId, UUID userId) {
        findActiveActivityById(activityId);

        ActivityParticipant participant = activityParticipantRepository.findByActivityIdAndUserId(activityId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E22));

        if (participant.getConfirmedAt() != null) {
            throw new BusinessException(ErrorCode.E18);
        }

        activityParticipantRepository.delete(participant);
        return new MessageResponse("Inscricao cancelada com sucesso");
    }

    private Activity findActiveActivityById(UUID activityId) {
        return activityRepository.findByIdAndDeletedAtIsNull(activityId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E21));
    }

    private void validateCreator(Activity activity, UUID userId, ErrorCode errorCode) {
        if (!activity.getCreator().getId().equals(userId)) {
            throw new BusinessException(errorCode);
        }
    }
}