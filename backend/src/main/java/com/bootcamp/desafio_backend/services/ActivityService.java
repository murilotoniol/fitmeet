package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.ActivityAddressRequest;
import com.bootcamp.desafio_backend.dtos.request.ApproveParticipantRequest;
import com.bootcamp.desafio_backend.dtos.request.CheckInRequest;
import com.bootcamp.desafio_backend.dtos.request.CreateActivityRequest;
import com.bootcamp.desafio_backend.dtos.request.UpdateActivityRequest;
import com.bootcamp.desafio_backend.dtos.response.ActivityAddressResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityCreatorResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityPageResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityTypeResponse;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.Activity;
import com.bootcamp.desafio_backend.models.ActivityAddress;
import com.bootcamp.desafio_backend.models.ActivityParticipant;
import com.bootcamp.desafio_backend.models.ActivityType;
import com.bootcamp.desafio_backend.models.Preference;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.ActivityAddressRepository;
import com.bootcamp.desafio_backend.repositories.ActivityParticipantRepository;
import com.bootcamp.desafio_backend.repositories.ActivityRepository;
import com.bootcamp.desafio_backend.repositories.ActivityTypeRepository;
import com.bootcamp.desafio_backend.repositories.PreferenceRepository;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ActivityTypeRepository activityTypeRepository;
    private final ActivityAddressRepository activityAddressRepository;
    private final ActivityParticipantRepository activityParticipantRepository;
    private final PreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public ActivityService(ActivityRepository activityRepository,
                           ActivityTypeRepository activityTypeRepository,
                           ActivityAddressRepository activityAddressRepository,
                           ActivityParticipantRepository activityParticipantRepository,
                           PreferenceRepository preferenceRepository,
                           UserRepository userRepository) {

        this.activityRepository = activityRepository;
        this.activityTypeRepository = activityTypeRepository;
        this.activityAddressRepository = activityAddressRepository;
        this.activityParticipantRepository = activityParticipantRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
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
        Sort sort = buildSort(orderBy, orderDirection);

        if (typeId != null) {
            Pageable pageable = PageRequest.of(page, pageSize, sort);
            Page<Activity> activityPage = activityRepository.findByType_IdAndDeletedAtIsNullAndCompletedAtIsNull(typeId, pageable);
            return mapToActivityPageResponse(activityPage, false);
        }

        List<Activity> prioritizedActivities = prioritizeActivitiesByInterest(
                activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(sort),
                userId
        );

        int start = Math.min(page * pageSize, prioritizedActivities.size());
        int end = Math.min(start + pageSize, prioritizedActivities.size());
        List<Activity> pageContent = prioritizedActivities.subList(start, end);

        Page<Activity> activityPage = new org.springframework.data.domain.PageImpl<>(
                pageContent,
                PageRequest.of(page, pageSize, sort),
                prioritizedActivities.size()
        );

        return mapToActivityPageResponse(activityPage, false);
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
                .map(activity -> mapToActivityResponse(activity, false))
                .toList();
    }

    public ActivityPageResponse getActivityCreatorInPage(UUID creatorId, int page, int pageSize, String orderBy, String orderDirection) {
        Pageable pageable = PageRequest.of(page, pageSize, buildSort(orderBy, orderDirection));
        Page<Activity> activityPage = activityRepository.findByCreatorIdAndDeletedAtIsNull(creatorId, pageable);

        return mapToActivityPageResponse(activityPage, true);
    }

    public List<ActivityResponse> getActivityCreatorAll(UUID creatorId) {
        List<Activity> activities = activityRepository.findByCreatorIdAndDeletedAtIsNull(creatorId, Sort.by("createdAt").descending());

        return activities.stream()
                .map(activity -> mapToActivityResponse(activity, true))
                .toList();
    }

    public ActivityPageResponse getActivityParticipantInPage(UUID userId, int page, int pageSize, String orderBy, String orderDirection) {
        Pageable pageable = PageRequest.of(page, pageSize, buildParticipantSort(orderBy, orderDirection));
        Page<ActivityParticipant> participantPage = activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(userId, pageable);

        List<ActivityResponse> activities = participantPage.getContent().stream()
                .map(this::mapParticipantActivityToResponse)
                .toList();

        return new ActivityPageResponse(
                participantPage.getNumber(),
                participantPage.getSize(),
                participantPage.getTotalElements(),
                participantPage.getTotalPages(),
                participantPage.hasPrevious() ? participantPage.getNumber() - 1 : null,
                participantPage.hasNext() ? participantPage.getNumber() + 1 : null,
                activities
        );
    }

    public List<ActivityResponse> getActivityParticipantAll(UUID userId) {
        return activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(userId, Sort.by("activity.createdAt").descending()).stream()
                .map(this::mapParticipantActivityToResponse)
                .toList();
    }

    public List<ParticipantResponse> getParticipants(UUID activityId, UUID userId) {
        Activity activity = findActiveActivityById(activityId);
        validateCreator(activity, userId, ErrorCode.E16);

        return activityParticipantRepository.findByActivityId(activityId).stream()
                .map(this::mapToParticipantResponse)
                .toList();
    }

    @Transactional
    public ActivityResponse create(UUID creatorId, CreateActivityRequest request) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E4));

        ActivityType activityType = activityTypeRepository.findById(request.typeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.E1));

        Activity activity = new Activity();
        activity.setTitle(request.title());
        activity.setDescription(request.description());
        activity.setType(activityType);
        activity.setImage(encodeImage(request.image(), true));
        activity.setScheduledDate(request.scheduleDate());
        activity.setCreatedAt(LocalDateTime.now());
        activity.setCompletedAt(null);
        activity.setDeletedAt(null);
        activity.setPrivate(Boolean.TRUE.equals(request.isPrivate()));
        activity.setConfirmationCode(generateConfirmationCode());
        activity.setCreator(creator);

        Activity savedActivity = activityRepository.save(activity);

        ActivityAddressRequest addressRequest = request.address();
        if (addressRequest != null) {
            ActivityAddress address = new ActivityAddress();
            address.setActivity(savedActivity);
            address.setLatitude(addressRequest.latitude());
            address.setLongitude(addressRequest.longitude());
            activityAddressRepository.save(address);
        }

        return mapToActivityResponse(savedActivity, true);
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
        participant.setConfirmedAt(null);

        activityParticipantRepository.save(participant);
        return new MessageResponse("Inscricao realizada com sucesso");
    }

    @Transactional
    public ActivityResponse update(UUID activityId, UUID userId, UpdateActivityRequest request) {
        Activity activity = findActiveActivityById(activityId);
        validateCreator(activity, userId, ErrorCode.E14);

        if (request.typeId() != null) {
            ActivityType activityType = activityTypeRepository.findById(request.typeId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.E1));
            activity.setType(activityType);
        }

        if (StringUtils.hasText(request.title())) {
            activity.setTitle(request.title());
        }

        if (StringUtils.hasText(request.description())) {
            activity.setDescription(request.description());
        }

        String image = encodeImage(request.image(), false);
        if (image != null) {
            activity.setImage(image);
        }

        if (request.scheduleDate() != null) {
            activity.setScheduledDate(request.scheduleDate());
        }

        if (request.isPrivate() != null) {
            activity.setPrivate(request.isPrivate());
        }

        Activity updatedActivity = activityRepository.save(activity);
        ActivityAddressRequest addressRequest = request.address();
        if (addressRequest != null) {
            ActivityAddress address = activityAddressRepository.findByActivityId(updatedActivity.getId())
                    .orElseGet(() -> {
                        ActivityAddress newAddress = new ActivityAddress();
                        newAddress.setActivity(updatedActivity);
                        return newAddress;
                    });
            address.setLatitude(addressRequest.latitude());
            address.setLongitude(addressRequest.longitude());
            activityAddressRepository.save(address);
        }
        return mapToActivityResponse(updatedActivity, true);
    }

    @Transactional
    public MessageResponse conclude(UUID activityId, UUID userId) {
        Activity activity = findActiveActivityById(activityId);
        validateCreator(activity, userId, ErrorCode.E17);

        if (activity.getCompletedAt() == null) {
            activity.setCompletedAt(LocalDateTime.now());
            activityRepository.save(activity);
        }

        return new MessageResponse("Atividade concluida com sucesso");
    }

    @Transactional
    public ParticipantResponse approveParticipant(UUID activityId, ApproveParticipantRequest request, UUID userId) {
        Activity activity = findActiveActivityById(activityId);
        validateCreator(activity, userId, ErrorCode.E16);

        ActivityParticipant participant = activityParticipantRepository.findByIdAndActivityId(request.participantId(), activityId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E1));

        participant.setApproved(request.approved());
        ActivityParticipant savedParticipant = activityParticipantRepository.save(participant);
        return mapToParticipantResponse(savedParticipant);
    }

    @Transactional
    public MessageResponse checkIn(UUID activityId, UUID userId, CheckInRequest request) {
        Activity activity = findActiveActivityById(activityId);

        if (activity.getCompletedAt() != null) {
            throw new BusinessException(ErrorCode.E13);
        }

        ActivityParticipant participant = activityParticipantRepository.findByActivityIdAndUserId(activityId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E9));

        if (!Boolean.TRUE.equals(participant.getApproved())) {
            throw new BusinessException(ErrorCode.E9);
        }

        if (participant.getConfirmedAt() != null) {
            throw new BusinessException(ErrorCode.E11);
        }

        if (activity.getConfirmationCode() == null || !activity.getConfirmationCode().equals(request.confirmationCode())) {
            throw new BusinessException(ErrorCode.E10);
        }

        participant.setConfirmedAt(LocalDateTime.now());
        activityParticipantRepository.save(participant);

        return new MessageResponse("Check-in realizado com sucesso");
    }

    @Transactional
    public MessageResponse unsubscribe(UUID activityId, UUID userId) {
        findActiveActivityById(activityId);

        ActivityParticipant participant = activityParticipantRepository.findByActivityIdAndUserId(activityId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E1));

        if (participant.getConfirmedAt() != null) {
            throw new BusinessException(ErrorCode.E18);
        }

        activityParticipantRepository.delete(participant);
        return new MessageResponse("Inscricao cancelada com sucesso");
    }

    @Transactional
    public MessageResponse delete(UUID activityId, UUID userId) {
        Activity activity = findActiveActivityById(activityId);
        validateCreator(activity, userId, ErrorCode.E15);

        activity.setDeletedAt(LocalDateTime.now());
        activityRepository.save(activity);

        return new MessageResponse("Atividade desativada com sucesso");
    }

    private Activity findActiveActivityById(UUID activityId) {
        return activityRepository.findByIdAndDeletedAtIsNull(activityId)
                .orElseThrow(() -> new BusinessException(ErrorCode.E1));
    }

    private void validateCreator(Activity activity, UUID userId, ErrorCode errorCode) {
        if (!activity.getCreator().getId().equals(userId)) {
            throw new BusinessException(errorCode);
        }
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

    private String generateConfirmationCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
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

    private String encodeImage(MultipartFile file, boolean required) {
        if (file == null || file.isEmpty()) {
            if (required) {
                throw new BusinessException(ErrorCode.E2);
            }
            return null;
        }

        String contentType = file.getContentType();
        if (contentType == null ||
                (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
            throw new BusinessException(ErrorCode.E2);
        }

        try {
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            return "data:" + contentType + ";base64," + base64Image;
        } catch (Exception exception) {
            throw new RuntimeException("Erro inesperado", exception);
        }
    }

    private ActivityPageResponse mapToActivityPageResponse(Page<Activity> pageData, boolean includeConfirmationCode) {
        List<ActivityResponse> activityResponses = pageData.getContent().stream()
                .map(activity -> mapToActivityResponse(activity, includeConfirmationCode))
                .toList();

        return new ActivityPageResponse(
                pageData.getNumber(),
                pageData.getSize(),
                pageData.getTotalElements(),
                pageData.getTotalPages(),
                pageData.hasPrevious() ? pageData.getNumber() - 1 : null,
                pageData.hasNext() ? pageData.getNumber() + 1 : null,
                activityResponses
        );
    }

    private ActivityResponse mapToActivityResponse(Activity activity, boolean includeConfirmationCode) {
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
                includeConfirmationCode ? activity.getConfirmationCode() : null,
                participantCount,
                addressResponse,
                activity.getScheduledDate(),
                activity.getCreatedAt(),
                activity.getCompletedAt(),
                activity.isPrivate(),
                creatorResponse,
                null
        );
    }

    private ActivityResponse mapParticipantActivityToResponse(ActivityParticipant participant) {
        Activity activity = participant.getActivity();
        String status = participant.getConfirmedAt() != null
                ? "CHECKED_IN"
                : Boolean.TRUE.equals(participant.getApproved()) ? "APPROVED" : "PENDING";

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

    private ParticipantResponse mapToParticipantResponse(ActivityParticipant participant) {
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
                participant.getConfirmedAt()
        );
    }
}
