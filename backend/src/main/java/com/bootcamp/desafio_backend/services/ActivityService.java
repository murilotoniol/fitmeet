package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.ActivityAddressRequest;
import com.bootcamp.desafio_backend.dtos.request.ApproveParticipantRequest;
import com.bootcamp.desafio_backend.dtos.request.CheckInRequest;
import com.bootcamp.desafio_backend.dtos.request.CreateActivityRequest;
import com.bootcamp.desafio_backend.dtos.request.UpdateActivityRequest;
import com.bootcamp.desafio_backend.dtos.response.ActivityPageResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityTypeResponse;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.Activity;
import com.bootcamp.desafio_backend.models.ActivityAddress;
import com.bootcamp.desafio_backend.models.ActivityType;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.ActivityAddressRepository;
import com.bootcamp.desafio_backend.repositories.ActivityRepository;
import com.bootcamp.desafio_backend.repositories.ActivityTypeRepository;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ActivityTypeRepository activityTypeRepository;
    private final ActivityAddressRepository activityAddressRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final AchievementService achievementService;
    private final ActivityQueryService activityQueryService;
    private final ParticipationService participationService;

    public ActivityService(ActivityRepository activityRepository,
                           ActivityTypeRepository activityTypeRepository,
                           ActivityAddressRepository activityAddressRepository,
                           UserRepository userRepository,
                           StorageService storageService,
                           AchievementService achievementService,
                           ActivityQueryService activityQueryService,
                           ParticipationService participationService) {

        this.activityRepository = activityRepository;
        this.activityTypeRepository = activityTypeRepository;
        this.activityAddressRepository = activityAddressRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.achievementService = achievementService;
        this.activityQueryService = activityQueryService;
        this.participationService = participationService;
    }

    public List<ActivityTypeResponse> getActivityTypes() {
        return activityQueryService.getActivityTypes();
    }

    public ActivityPageResponse getActivitiesInPage(UUID userId, int page, int pageSize, UUID typeId, String orderBy, String orderDirection) {
        return activityQueryService.getActivitiesInPage(userId, page, pageSize, typeId, orderBy, orderDirection);
    }

    public List<ActivityResponse> getActivityAll(UUID userId, UUID typeId, String orderBy, String orderDirection) {
        return activityQueryService.getActivityAll(userId, typeId, orderBy, orderDirection);
    }

    public ActivityPageResponse getActivityCreatorInPage(UUID creatorId, int page, int pageSize, String orderBy, String orderDirection) {
        return activityQueryService.getActivityCreatorInPage(creatorId, page, pageSize, orderBy, orderDirection);
    }

    public List<ActivityResponse> getActivityCreatorAll(UUID creatorId) {
        return activityQueryService.getActivityCreatorAll(creatorId);
    }

    public ActivityPageResponse getActivityParticipantInPage(UUID userId, int page, int pageSize, String orderBy, String orderDirection) {
        return activityQueryService.getActivityParticipantInPage(userId, page, pageSize, orderBy, orderDirection);
    }

    public List<ActivityResponse> getActivityParticipantAll(UUID userId) {
        return activityQueryService.getActivityParticipantAll(userId);
    }

    public List<ParticipantResponse> getParticipants(UUID activityId, UUID userId) {
        return participationService.getParticipants(activityId, userId);
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
        activity.setImage(uploadImage(request.image(), "activities", true));
        activity.setScheduledDate(request.scheduledDate());
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

        achievementService.grantFirstActivityCreated(creator);

        return activityQueryService.mapToActivityResponse(savedActivity, true);
    }

    public MessageResponse subscribe(UUID activityId, UUID userId) {
        return participationService.subscribe(activityId, userId);
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

        String image = uploadImage(request.image(), "activities", false);
        if (image != null) {
            activity.setImage(image);
        }

        if (request.scheduledDate() != null) {
            activity.setScheduledDate(request.scheduledDate());
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
        return activityQueryService.mapToActivityResponse(updatedActivity, true);
    }

    @Transactional
    public MessageResponse conclude(UUID activityId, UUID userId) {
        Activity activity = findActiveActivityById(activityId);
        validateCreator(activity, userId, ErrorCode.E17);

        if (activity.getCompletedAt() == null) {
            activity.setCompletedAt(LocalDateTime.now());
            activityRepository.save(activity);
            achievementService.grantFirstActivityCompleted(activity.getCreator());
        }

        return new MessageResponse("Atividade concluida com sucesso");
    }

    public ParticipantResponse approveParticipant(UUID activityId, ApproveParticipantRequest request, UUID userId) {
        return participationService.approveParticipant(activityId, request, userId);
    }

    public MessageResponse checkIn(UUID activityId, UUID userId, CheckInRequest request) {
        return participationService.checkIn(activityId, userId, request);
    }

    public MessageResponse unsubscribe(UUID activityId, UUID userId) {
        return participationService.unsubscribe(activityId, userId);
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

    private String generateConfirmationCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String uploadImage(MultipartFile file, String folder, boolean required) {
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

        return storageService.uploadImage(file, folder);
    }
}
