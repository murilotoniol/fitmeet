package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.response.ActivityAddressResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityCreatorResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityPageResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityTypeResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.enums.ParticipationStatus;
import com.bootcamp.desafio_backend.models.Activity;
import com.bootcamp.desafio_backend.models.ActivityParticipant;
import com.bootcamp.desafio_backend.models.ActivityType;
import com.bootcamp.desafio_backend.models.Preference;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.ActivityAddressRepository;
import com.bootcamp.desafio_backend.repositories.ActivityParticipantRepository;
import com.bootcamp.desafio_backend.repositories.ActivityRepository;
import com.bootcamp.desafio_backend.repositories.ActivityTypeRepository;
import com.bootcamp.desafio_backend.repositories.PreferenceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ActivityQueryService {

    private final ActivityRepository activityRepository;
    private final ActivityTypeRepository activityTypeRepository;
    private final ActivityAddressRepository activityAddressRepository;
    private final ActivityParticipantRepository activityParticipantRepository;
    private final PreferenceRepository preferenceRepository;

    public ActivityQueryService(ActivityRepository activityRepository,
                                ActivityTypeRepository activityTypeRepository,
                                ActivityAddressRepository activityAddressRepository,
                                ActivityParticipantRepository activityParticipantRepository,
                                PreferenceRepository preferenceRepository) {
        this.activityRepository = activityRepository;
        this.activityTypeRepository = activityTypeRepository;
        this.activityAddressRepository = activityAddressRepository;
        this.activityParticipantRepository = activityParticipantRepository;
        this.preferenceRepository = preferenceRepository;
    }

    public List<ActivityTypeResponse> getActivityTypes() {
        return activityTypeRepository.findAll(Sort.by("name").ascending()).stream()
                .map(type -> new ActivityTypeResponse(
                        type.getId(),
                        type.getName(),
                        type.getDescription(),
                        type.getImage()
                ))
                .toList();
    }

    public ActivityPageResponse getActivitiesInPage(UUID userId, int page, int pageSize, UUID typeId, String orderBy, String orderDirection) {
        int pageIndex = normalizePage(page);
        Sort sort = buildSort(orderBy, orderDirection);

        if (typeId != null) {
            Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);
            Page<Activity> activityPage = activityRepository.findByType_IdAndDeletedAtIsNullAndCompletedAtIsNull(typeId, pageable);
            return mapToActivityPageResponse(activityPage, false, userId);
        }

        List<Activity> prioritizedActivities = prioritizeActivitiesByInterest(
                activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(sort),
                userId
        );

        int start = Math.min(pageIndex * pageSize, prioritizedActivities.size());
        int end = Math.min(start + pageSize, prioritizedActivities.size());
        List<Activity> pageContent = prioritizedActivities.subList(start, end);

        Page<Activity> activityPage = new PageImpl<>(
                pageContent,
                PageRequest.of(pageIndex, pageSize, sort),
                prioritizedActivities.size()
        );

        return mapToActivityPageResponse(activityPage, false, userId);
    }

    public List<ActivityResponse> getActivityAll(UUID userId, UUID typeId, String orderBy, String orderDirection) {
        Sort sort = buildSort(orderBy, orderDirection);

        List<Activity> activities = typeId != null
                ? activityRepository.findByType_IdAndDeletedAtIsNullAndCompletedAtIsNull(typeId, sort)
                : activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(sort);

        if (typeId == null) {
            activities = prioritizeActivitiesByInterest(activities, userId);
        }

        return activities.stream()
                .map(activity -> mapToActivityResponse(activity, false, userId))
                .toList();
    }

    public ActivityPageResponse getActivityCreatorInPage(UUID creatorId, int page, int pageSize, String orderBy, String orderDirection) {
        Pageable pageable = PageRequest.of(normalizePage(page), pageSize, buildSort(orderBy, orderDirection));
        Page<Activity> activityPage = activityRepository.findByCreatorIdAndDeletedAtIsNull(creatorId, pageable);

        return mapToActivityPageResponse(activityPage, true, null);
    }

    public List<ActivityResponse> getActivityCreatorAll(UUID creatorId) {
        List<Activity> activities = activityRepository.findByCreatorIdAndDeletedAtIsNull(creatorId, Sort.by("createdAt").descending());

        return activities.stream()
                .map(activity -> mapToActivityResponse(activity, true))
                .toList();
    }

    public ActivityPageResponse getActivityParticipantInPage(UUID userId, int page, int pageSize, String orderBy, String orderDirection) {
        Pageable pageable = PageRequest.of(normalizePage(page), pageSize, buildParticipantSort(orderBy, orderDirection));
        Page<ActivityParticipant> participantPage = activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(userId, pageable);

        List<ActivityResponse> activities = participantPage.getContent().stream()
                .map(this::mapParticipantActivityToResponse)
                .toList();

        return new ActivityPageResponse(
                participantPage.getNumber() + 1,
                participantPage.getSize(),
                participantPage.getTotalElements(),
                participantPage.getTotalPages(),
                participantPage.hasPrevious() ? participantPage.getNumber() : null,
                participantPage.hasNext() ? participantPage.getNumber() + 2 : null,
                activities
        );
    }

    public List<ActivityResponse> getActivityParticipantAll(UUID userId) {
        return activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(userId, Sort.by("activity.createdAt").descending()).stream()
                .map(this::mapParticipantActivityToResponse)
                .toList();
    }

    public ActivityResponse mapToActivityResponse(Activity activity, boolean includeConfirmationCode) {
        return mapToActivityResponse(activity, includeConfirmationCode, null);
    }

    public ActivityResponse mapToActivityResponse(Activity activity, boolean includeConfirmationCode, UUID userId) {
        ActivityAddressResponse addressResponse = activityAddressRepository.findByActivityId(activity.getId())
                .map(address -> new ActivityAddressResponse(address.getLatitude(), address.getLongitude()))
                .orElse(null);

        ActivityCreatorResponse creatorResponse = new ActivityCreatorResponse(
                activity.getCreator().getId(),
                activity.getCreator().getName(),
                activity.getCreator().getAvatar()
        );

        int participantCount = activityParticipantRepository.countByActivityId(activity.getId());
        ParticipationStatus subscriptionStatus = resolveSubscriptionStatus(activity.getId(), userId);

        return new ActivityResponse(
                activity.getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getType().getName(),
                activity.getImage(),
                includeConfirmationCode ? activity.getConfirmationCode() : null,
                participantCount,
                addressResponse,
                activity.getScheduledDate(),
                activity.getCreatedAt(),
                activity.getCompletedAt(),
                activity.isPrivate(),
                creatorResponse,
                subscriptionStatus
        );
    }

    public ParticipantResponse mapToParticipantResponse(ActivityParticipant participant) {
        User user = participant.getUser();
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getCpf(),
                user.getAvatar(),
                user.getXp(),
                user.getLevel()
        );

        return new ParticipantResponse(
                participant.getId(),
                userResponse,
                participant.getApproved(),
                participant.getConfirmedAt() != null,
                participant.getCreatedAt()
        );
    }

    private ActivityPageResponse mapToActivityPageResponse(Page<Activity> pageData, boolean includeConfirmationCode, UUID userId) {
        List<ActivityResponse> activityResponses = pageData.getContent().stream()
                .map(activity -> mapToActivityResponse(activity, includeConfirmationCode, userId))
                .toList();

        return new ActivityPageResponse(
                pageData.getNumber() + 1,
                pageData.getSize(),
                pageData.getTotalElements(),
                pageData.getTotalPages(),
                pageData.hasPrevious() ? pageData.getNumber() : null,
                pageData.hasNext() ? pageData.getNumber() + 2 : null,
                activityResponses
        );
    }

    private ParticipationStatus resolveSubscriptionStatus(UUID activityId, UUID userId) {
        if (userId == null) {
            return null;
        }

        return activityParticipantRepository.findByActivityIdAndUserId(activityId, userId)
                .map(this::resolveParticipationStatus)
                .orElse(null);
    }

    private ParticipationStatus resolveParticipationStatus(ActivityParticipant participant) {
        if (participant.getConfirmedAt() != null) {
            return ParticipationStatus.CHECKED_IN;
        }

        if (participant.getStatus() != null) {
            return participant.getStatus();
        }

        return Boolean.TRUE.equals(participant.getApproved())
                ? ParticipationStatus.APPROVED
                : ParticipationStatus.PENDING;
    }

    private ActivityResponse mapParticipantActivityToResponse(ActivityParticipant participant) {
        Activity activity = participant.getActivity();
        ParticipationStatus status = resolveParticipationStatus(participant);

        ActivityAddressResponse addressResponse = activityAddressRepository.findByActivityId(activity.getId())
                .map(address -> new ActivityAddressResponse(address.getLatitude(), address.getLongitude()))
                .orElse(null);

        ActivityCreatorResponse creatorResponse = new ActivityCreatorResponse(
                activity.getCreator().getId(),
                activity.getCreator().getName(),
                activity.getCreator().getAvatar()
        );

        int participantCount = activityParticipantRepository.countByActivityId(activity.getId());

        return new ActivityResponse(
                activity.getId(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getType().getName(),
                activity.getImage(),
                null,
                participantCount,
                addressResponse,
                activity.getScheduledDate(),
                activity.getCreatedAt(),
                activity.getCompletedAt(),
                activity.isPrivate(),
                creatorResponse,
                status
        );
    }

    private List<Activity> prioritizeActivitiesByInterest(List<Activity> activities, UUID userId) {
        Set<UUID> preferredTypeIds = preferenceRepository.findByUserId(userId).stream()
                .map(Preference::getType)
                .map(ActivityType::getId)
                .collect(java.util.stream.Collectors.toSet());

        if (preferredTypeIds.isEmpty()) {
            return activities;
        }

        return activities.stream()
                .sorted(Comparator.comparing(
                        (Activity activity) -> !preferredTypeIds.contains(activity.getType().getId())
                ))
                .toList();
    }

    private Sort buildSort(String orderBy, String orderDirection) {
        String sortProperty = (orderBy != null && !orderBy.isBlank()) ? orderBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(orderDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, sortProperty);
    }

    private Sort buildParticipantSort(String orderBy, String orderDirection) {
        String requestedProperty = (orderBy != null && !orderBy.isBlank()) ? orderBy : "createdAt";
        String sortProperty = switch (requestedProperty) {
            case "title" -> "activity.title";
            case "scheduledDate" -> "activity.scheduledDate";
            case "completedAt" -> "activity.completedAt";
            case "createdAt" -> "activity.createdAt";
            default -> "activity." + requestedProperty;
        };

        Sort.Direction direction = "asc".equalsIgnoreCase(orderDirection) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(direction, sortProperty);
    }

    private int normalizePage(int page) {
        return Math.max(page - 1, 0);
    }
}