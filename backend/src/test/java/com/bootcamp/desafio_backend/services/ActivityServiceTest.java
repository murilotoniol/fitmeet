package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.ApproveParticipantRequest;
import com.bootcamp.desafio_backend.dtos.request.CheckInRequest;
import com.bootcamp.desafio_backend.dtos.request.CreateActivityRequest;
import com.bootcamp.desafio_backend.dtos.response.ActivityPageResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityResponse;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
import com.bootcamp.desafio_backend.enums.ParticipationStatus;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
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
import com.bootcamp.desafio_backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private ActivityTypeRepository activityTypeRepository;
    @Mock
    private ActivityAddressRepository activityAddressRepository;
    @Mock
    private ActivityParticipantRepository activityParticipantRepository;
    @Mock
    private PreferenceRepository preferenceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StorageService storageService;
    @Mock
    private ExperienceService experienceService;
    @Mock
    private AchievementService achievementService;

    private ActivityService activityService;

    private UUID creatorId;
    private UUID participantUserId;
    private UUID activityId;
    private UUID participantId;
    private User creator;
    private User participantUser;
    private Activity activity;
    private ActivityParticipant participant;

    @BeforeEach
    void setUp() {
        creatorId = UUID.randomUUID();
        participantUserId = UUID.randomUUID();
        activityId = UUID.randomUUID();
        participantId = UUID.randomUUID();

        creator = buildUser(creatorId, "Criador", "criador@test.com");
        participantUser = buildUser(participantUserId, "Participante", "participante@test.com");

        ActivityType activityType = new ActivityType();
        activityType.setId(UUID.randomUUID());
        activityType.setName("Esporte");

        activity = new Activity();
        activity.setId(activityId);
        activity.setTitle("Treino");
        activity.setDescription("Treino coletivo");
        activity.setType(activityType);
        activity.setImage("image.png");
        activity.setConfirmationCode("ABC12345");
        activity.setScheduledDate(LocalDateTime.now().plusDays(1));
        activity.setCreatedAt(LocalDateTime.now().minusDays(1));
        activity.setPrivate(false);
        activity.setCreator(creator);

        participant = new ActivityParticipant();
        participant.setId(participantId);
        participant.setActivity(activity);
        participant.setUser(participantUser);
        participant.setApproved(true);
        participant.setStatus(ParticipationStatus.APPROVED);
        participant.setCreatedAt(LocalDateTime.now().minusHours(2));

        lenient().when(storageService.uploadImage(any(), eq("activities")))
                .thenReturn("http://localhost:4566/backend-challenge-images/activities/test.png");

        ActivityQueryService activityQueryService = new ActivityQueryService(
                activityRepository,
                activityTypeRepository,
                activityAddressRepository,
                activityParticipantRepository,
                preferenceRepository
        );
        ParticipationService participationService = new ParticipationService(
                activityRepository,
                activityParticipantRepository,
                userRepository,
                experienceService,
                achievementService,
                activityQueryService
        );
        activityService = new ActivityService(
                activityRepository,
                activityTypeRepository,
                activityAddressRepository,
                userRepository,
                storageService,
                achievementService,
                activityQueryService,
                participationService
        );
    }

    @Test
    void getActivityParticipantInPage_ReturnsMappedActivities() {
        Page<ActivityParticipant> page = new PageImpl<>(
                List.of(participant),
                PageRequest.of(0, 10),
                1
        );

        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(eq(participantUserId), any(PageRequest.class)))
                .thenReturn(page);

        ActivityPageResponse response = activityService.getActivityParticipantInPage(
                participantUserId,
                1,
                10,
                "createdAt",
                "desc"
        );

        assertEquals(1, response.page());
        assertNull(response.previous());
        assertNull(response.next());
        assertEquals(1, response.activities().size());
        assertEquals(ParticipationStatus.APPROVED, response.activities().get(0).userSubscriptionStatus());
        assertEquals(1, response.totalActivities());
    }

    @Test
    void getActivitiesInPage_WithoutTypeFilter_PrioritizesUserInterests() {
        UUID preferredTypeId = UUID.randomUUID();

        ActivityType preferredType = new ActivityType();
        preferredType.setId(preferredTypeId);
        preferredType.setName("Esporte");

        Activity preferredActivity = new Activity();
        preferredActivity.setId(UUID.randomUUID());
        preferredActivity.setTitle("Preferida");
        preferredActivity.setDescription("Atividade preferida");
        preferredActivity.setType(preferredType);
        preferredActivity.setImage("image.png");
        preferredActivity.setScheduledDate(LocalDateTime.now().plusDays(1));
        preferredActivity.setCreatedAt(LocalDateTime.now().minusDays(2));
        preferredActivity.setCreator(creator);

        Activity nonPreferredActivity = new Activity();
        nonPreferredActivity.setId(UUID.randomUUID());
        nonPreferredActivity.setTitle("Nao preferida");
        nonPreferredActivity.setDescription("Outra atividade");
        nonPreferredActivity.setType(activity.getType());
        nonPreferredActivity.setImage("image-2.png");
        nonPreferredActivity.setScheduledDate(LocalDateTime.now().plusDays(2));
        nonPreferredActivity.setCreatedAt(LocalDateTime.now().minusDays(1));
        nonPreferredActivity.setCreator(creator);

        Preference preference = new Preference();
        preference.setUser(participantUser);
        preference.setType(preferredType);

        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of(preference));
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of(nonPreferredActivity, preferredActivity));
        when(activityParticipantRepository.countByActivityId(preferredActivity.getId())).thenReturn(0);
        when(activityParticipantRepository.countByActivityId(nonPreferredActivity.getId())).thenReturn(0);
        when(activityAddressRepository.findByActivityId(preferredActivity.getId())).thenReturn(Optional.empty());
        when(activityAddressRepository.findByActivityId(nonPreferredActivity.getId())).thenReturn(Optional.empty());

        ActivityPageResponse response = activityService.getActivitiesInPage(
                participantUserId,
                1,
                10,
                null,
                "createdAt",
                "desc"
        );

        assertEquals(1, response.page());
        assertNull(response.previous());
        assertNull(response.next());
        assertEquals(2, response.activities().size());
        assertEquals(preferredActivity.getId(), response.activities().get(0).id());
        assertEquals(nonPreferredActivity.getId(), response.activities().get(1).id());
    }

    @Test
    void getActivitiesInPage_WhenUserIsSubscribed_FillsSubscriptionStatus() {
        participant.setConfirmedAt(LocalDateTime.now().minusMinutes(1));

        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of());
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of(activity));
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        ActivityPageResponse response = activityService.getActivitiesInPage(
                participantUserId,
                1,
                10,
                null,
                "createdAt",
                "desc"
        );

        assertEquals(1, response.activities().size());
        assertEquals(ParticipationStatus.CHECKED_IN, response.activities().get(0).userSubscriptionStatus());
    }

    @Test
    void getActivityAll_WithoutTypeFilter_PrioritizesUserInterests() {
        UUID preferredTypeId = UUID.randomUUID();

        ActivityType preferredType = new ActivityType();
        preferredType.setId(preferredTypeId);
        preferredType.setName("Esporte");

        Activity preferredActivity = new Activity();
        preferredActivity.setId(UUID.randomUUID());
        preferredActivity.setTitle("Preferida");
        preferredActivity.setDescription("Atividade preferida");
        preferredActivity.setType(preferredType);
        preferredActivity.setImage("image.png");
        preferredActivity.setScheduledDate(LocalDateTime.now().plusDays(1));
        preferredActivity.setCreatedAt(LocalDateTime.now().minusDays(2));
        preferredActivity.setCreator(creator);

        Activity nonPreferredActivity = new Activity();
        nonPreferredActivity.setId(UUID.randomUUID());
        nonPreferredActivity.setTitle("Nao preferida");
        nonPreferredActivity.setDescription("Outra atividade");
        nonPreferredActivity.setType(activity.getType());
        nonPreferredActivity.setImage("image-2.png");
        nonPreferredActivity.setScheduledDate(LocalDateTime.now().plusDays(2));
        nonPreferredActivity.setCreatedAt(LocalDateTime.now().minusDays(1));
        nonPreferredActivity.setCreator(creator);

        Preference preference = new Preference();
        preference.setUser(participantUser);
        preference.setType(preferredType);

        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of(preference));
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of(nonPreferredActivity, preferredActivity));
        when(activityParticipantRepository.countByActivityId(preferredActivity.getId())).thenReturn(0);
        when(activityParticipantRepository.countByActivityId(nonPreferredActivity.getId())).thenReturn(0);
        when(activityAddressRepository.findByActivityId(preferredActivity.getId())).thenReturn(Optional.empty());
        when(activityAddressRepository.findByActivityId(nonPreferredActivity.getId())).thenReturn(Optional.empty());

        List<ActivityResponse> responses = activityService.getActivityAll(
                participantUserId,
                null,
                "createdAt",
                "desc"
        );

        assertEquals(2, responses.size());
        assertEquals(preferredActivity.getId(), responses.get(0).id());
        assertEquals(nonPreferredActivity.getId(), responses.get(1).id());
    }

    @Test
    void getActivityAll_WhenUserIsSubscribed_FillsSubscriptionStatus() {
        participant.setApproved(true);

        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of(activity));
        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of());
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        List<ActivityResponse> responses = activityService.getActivityAll(
                participantUserId,
                null,
                "createdAt",
                "desc"
        );

        assertEquals(1, responses.size());
        assertEquals(ParticipationStatus.APPROVED, responses.get(0).userSubscriptionStatus());
    }

    @Test
    void getActivityCreatorInPage_DoesNotResolveCreatorSubscriptionStatus() {
        Page<Activity> page = new PageImpl<>(
                List.of(activity),
                PageRequest.of(0, 10),
                1
        );

        when(activityRepository.findByCreatorIdAndDeletedAtIsNull(eq(creatorId), any(PageRequest.class)))
                .thenReturn(page);
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityService.getActivityCreatorInPage(
                creatorId,
                1,
                10,
                "createdAt",
                "desc"
        );

        assertEquals(1, response.activities().size());
        assertNull(response.activities().get(0).userSubscriptionStatus());
        verify(activityParticipantRepository, never()).findByActivityIdAndUserId(activityId, creatorId);
    }

    @Test
    void getActivityParticipantAll_ReturnsMappedActivities() {
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(eq(participantUserId), any(Sort.class)))
                .thenReturn(List.of(participant));

        List<ActivityResponse> responses = activityService.getActivityParticipantAll(participantUserId);

        assertEquals(1, responses.size());
        assertEquals(activityId, responses.get(0).id());
        assertEquals(ParticipationStatus.APPROVED, responses.get(0).userSubscriptionStatus());
    }

    @Test
    void getParticipants_AsCreator_ReturnsParticipants() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityId(activityId)).thenReturn(List.of(participant));

        List<ParticipantResponse> responses = activityService.getParticipants(activityId, creatorId);

        assertEquals(1, responses.size());
        assertEquals(participantId, responses.get(0).id());
        assertEquals(participantUserId, responses.get(0).user().id());
        assertFalse(responses.get(0).checkedIn());
    }

    @Test
    void subscribe_PublicActivity_AutoApproves() {
        stubFindActiveActivity();
        when(activityParticipantRepository.existsByActivityIdAndUserId(activityId, participantUserId)).thenReturn(false);
        when(userRepository.findById(participantUserId)).thenReturn(Optional.of(participantUser));

        MessageResponse response = activityService.subscribe(activityId, participantUserId);

        ArgumentCaptor<ActivityParticipant> captor = ArgumentCaptor.forClass(ActivityParticipant.class);
        verify(activityParticipantRepository).save(captor.capture());

        assertEquals("Inscricao realizada com sucesso", response.message());
        assertTrue(captor.getValue().getApproved());
        assertEquals(ParticipationStatus.APPROVED, captor.getValue().getStatus());
        assertNull(captor.getValue().getConfirmedAt());
        assertNotNull(captor.getValue().getCreatedAt());
    }

    @Test
    void subscribe_PrivateActivity_CreatesPendingSubscription() {
        activity.setPrivate(true);

        stubFindActiveActivity();
        when(activityParticipantRepository.existsByActivityIdAndUserId(activityId, participantUserId)).thenReturn(false);
        when(userRepository.findById(participantUserId)).thenReturn(Optional.of(participantUser));

        activityService.subscribe(activityId, participantUserId);

        ArgumentCaptor<ActivityParticipant> captor = ArgumentCaptor.forClass(ActivityParticipant.class);
        verify(activityParticipantRepository).save(captor.capture());
        assertFalse(captor.getValue().getApproved());
        assertEquals(ParticipationStatus.PENDING, captor.getValue().getStatus());
        assertNotNull(captor.getValue().getCreatedAt());
    }

    @Test
    void subscribe_DuplicateRegistration_ThrowsConflict() {
        stubFindActiveActivity();
        when(activityParticipantRepository.existsByActivityIdAndUserId(activityId, participantUserId)).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.subscribe(activityId, participantUserId));

        assertEquals(ErrorCode.E7, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void subscribe_CreatorTryingToJoin_ThrowsUnprocessable() {
        stubFindActiveActivity();
        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.subscribe(activityId, creatorId));

        assertEquals(ErrorCode.E8, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void subscribe_CompletedActivity_ThrowsUnprocessable() {
        activity.setCompletedAt(LocalDateTime.now());

        stubFindActiveActivity();
        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.subscribe(activityId, participantUserId));

        assertEquals(ErrorCode.E12, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void conclude_AsCreator_CompletesActivity() {
        stubFindActiveActivity();
        MessageResponse response = activityService.conclude(activityId, creatorId);

        assertEquals("Atividade concluida com sucesso", response.message());
        assertNotNull(activity.getCompletedAt());
        verify(activityRepository).save(activity);
    }

    @Test
    void create_FirstActivityCreatedAchievement_IsRequested() {
        ActivityType type = new ActivityType();
        type.setId(UUID.randomUUID());

        CreateActivityRequest request = new CreateActivityRequest(
                "Corrida",
                "Descricao",
                type.getId(),
                new MockMultipartFile("image", "image.png", "image/png", "img".getBytes()),
                LocalDateTime.now().plusDays(1),
                null,
                false
        );

        when(userRepository.findById(creatorId)).thenReturn(Optional.of(creator));
        when(activityTypeRepository.findById(type.getId())).thenReturn(Optional.of(type));
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ActivityResponse response = activityService.create(creatorId, request);

        assertEquals("http://localhost:4566/backend-challenge-images/activities/test.png", response.image());
        verify(achievementService).grantFirstActivityCreated(creator);
    }

    @Test
    void conclude_NonCreator_ThrowsForbidden() {
        stubFindActiveActivity();
        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.conclude(activityId, participantUserId));

        assertEquals(ErrorCode.E17, exception.getErrorCode());
        verify(activityRepository, never()).save(any(Activity.class));
    }

    @Test
    void approveParticipant_AsCreator_UpdatesApprovalStatus() {
        participant.setApproved(false);
        stubFindActiveActivity();
        when(activityParticipantRepository.findByIdAndActivityId(participantId, activityId)).thenReturn(Optional.of(participant));
        when(activityParticipantRepository.save(participant)).thenReturn(participant);

        ParticipantResponse response = activityService.approveParticipant(
                activityId,
                new ApproveParticipantRequest(participantId, true),
                creatorId
        );

        assertTrue(response.approved());
        assertEquals(ParticipationStatus.APPROVED, participant.getStatus());
        assertEquals(participant.getCreatedAt(), response.registeredAt());
        verify(activityParticipantRepository).save(participant);
    }

    @Test
    void approveParticipant_WhenRejected_UpdatesStatusToRejected() {
        participant.setApproved(false);
        participant.setStatus(ParticipationStatus.PENDING);
        stubFindActiveActivity();
        when(activityParticipantRepository.findByIdAndActivityId(participantId, activityId)).thenReturn(Optional.of(participant));
        when(activityParticipantRepository.save(participant)).thenReturn(participant);

        ParticipantResponse response = activityService.approveParticipant(
                activityId,
                new ApproveParticipantRequest(participantId, false),
                creatorId
        );

        assertFalse(response.approved());
        assertEquals(ParticipationStatus.REJECTED, participant.getStatus());
        verify(activityParticipantRepository).save(participant);
    }

    @Test
    void approveParticipant_NonCreator_ThrowsForbidden() {
        stubFindActiveActivity();
        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.approveParticipant(
                        activityId,
                        new ApproveParticipantRequest(participantId, true),
                        participantUserId
                ));

        assertEquals(ErrorCode.E16, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void checkIn_Success() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        MessageResponse response = activityService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345"));

        assertEquals("Check-in realizado com sucesso", response.message());
        assertNotNull(participant.getConfirmedAt());
        assertEquals(ParticipationStatus.CHECKED_IN, participant.getStatus());
        verify(activityParticipantRepository).save(participant);
        verify(experienceService).applyCheckInExperience(participantUser, creator);
        verify(achievementService).grantFirstCheckIn(participantUser);
    }

    @Test
    void checkIn_FirstCheckInAchievement_IsRequested() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        activityService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345"));

        verify(achievementService).grantFirstCheckIn(participantUser);
    }

    @Test
    void checkIn_TechnologyAchievement_IsRequestedForTechnologyActivities() {
        activity.getType().setName("Tecnologia");

        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        activityService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345"));

        verify(achievementService).grantFirstTechCheckIn(participantUser);
    }

    @Test
    void checkIn_NotApproved_ThrowsUnprocessable() {
        participant.setApproved(false);
        participant.setStatus(ParticipationStatus.PENDING);
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345")));

        assertEquals(ErrorCode.E9, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void checkIn_InvalidConfirmationCode_ThrowsBadRequest() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.checkIn(activityId, participantUserId, new CheckInRequest("ERRADO")));

        assertEquals(ErrorCode.E10, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void checkIn_AlreadyConfirmed_ThrowsConflict() {
        participant.setConfirmedAt(LocalDateTime.now().minusMinutes(5));
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345")));

        assertEquals(ErrorCode.E11, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void checkIn_CompletedActivity_ThrowsUnprocessable() {
        activity.setCompletedAt(LocalDateTime.now());

        stubFindActiveActivity();
        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345")));

        assertEquals(ErrorCode.E13, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void unsubscribe_Success() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        MessageResponse response = activityService.unsubscribe(activityId, participantUserId);

        assertEquals("Inscricao cancelada com sucesso", response.message());
        verify(activityParticipantRepository).delete(participant);
    }

    @Test
    void unsubscribe_AfterCheckIn_ThrowsUnprocessable() {
        participant.setConfirmedAt(LocalDateTime.now().minusMinutes(10));
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> activityService.unsubscribe(activityId, participantUserId));

        assertEquals(ErrorCode.E18, exception.getErrorCode());
        verify(activityParticipantRepository, never()).delete(any(ActivityParticipant.class));
    }

    private User buildUser(UUID id, String name, String email) {
        User user = new User();
        user.setId(id);
        user.setName(name);
        user.setEmail(email);
        user.setCpf("12345678901");
        user.setXp(0);
        user.setLevel(1);
        return user;
    }

    private void stubFindActiveActivity() {
        when(activityRepository.findByIdAndDeletedAtIsNull(activityId)).thenReturn(Optional.of(activity));
    }
}
