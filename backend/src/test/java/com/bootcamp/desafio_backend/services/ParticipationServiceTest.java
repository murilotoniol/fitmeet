package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.request.ApproveParticipantRequest;
import com.bootcamp.desafio_backend.dtos.request.CheckInRequest;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.enums.ParticipationStatus;
import com.bootcamp.desafio_backend.exceptions.BusinessException;
import com.bootcamp.desafio_backend.exceptions.ErrorCode;
import com.bootcamp.desafio_backend.models.Activity;
import com.bootcamp.desafio_backend.models.ActivityParticipant;
import com.bootcamp.desafio_backend.models.ActivityType;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.repositories.ActivityParticipantRepository;
import com.bootcamp.desafio_backend.repositories.ActivityRepository;
import com.bootcamp.desafio_backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ParticipationServiceTest {

    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private ActivityParticipantRepository activityParticipantRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ExperienceService experienceService;
    @Mock
    private AchievementService achievementService;
    @Mock
    private ActivityQueryService activityQueryService;

    private ParticipationService participationService;

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

        participationService = new ParticipationService(
                activityRepository,
                activityParticipantRepository,
                userRepository,
                experienceService,
                achievementService,
                activityQueryService
        );
    }

    @Test
    void getParticipants_AsCreator_ReturnsParticipantList() {
        stubFindActivity();
        when(activityParticipantRepository.findByActivityId(activityId)).thenReturn(List.of(participant));
        stubMapParticipantResponse(participant);

        List<ParticipantResponse> responses = participationService.getParticipants(activityId, creatorId);

        assertEquals(1, responses.size());
        assertEquals(participantId, responses.get(0).id());
        assertEquals(participantUserId, responses.get(0).user().id());
    }

    @Test
    void getParticipants_WhenParticipantWasRejected_DoesNotReturnRejectedParticipant() {
        ActivityParticipant rejectedParticipant = new ActivityParticipant();
        rejectedParticipant.setId(UUID.randomUUID());
        rejectedParticipant.setActivity(activity);
        rejectedParticipant.setUser(buildUser(UUID.randomUUID(), "Rejeitado", "rejeitado@test.com"));
        rejectedParticipant.setApproved(false);
        rejectedParticipant.setStatus(ParticipationStatus.REJECTED);
        rejectedParticipant.setCreatedAt(LocalDateTime.now().minusHours(1));

        stubFindActivity();
        when(activityParticipantRepository.findByActivityId(activityId))
                .thenReturn(List.of(participant, rejectedParticipant));
        stubMapParticipantResponse(participant);

        List<ParticipantResponse> responses = participationService.getParticipants(activityId, creatorId);

        assertEquals(1, responses.size());
        assertEquals(participantId, responses.get(0).id());
    }

    @Test
    void getParticipants_AsNonCreator_ThrowsE16() {
        UUID strangerId = UUID.randomUUID();
        stubFindActivity();
        when(activityParticipantRepository.existsByActivityIdAndUserId(activityId, strangerId)).thenReturn(false);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.getParticipants(activityId, strangerId));

        assertEquals(ErrorCode.E16, exception.getErrorCode());
    }

    @Test
    void getParticipants_ActivityNotFound_ThrowsE21() {
        when(activityRepository.findById(activityId)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.getParticipants(activityId, creatorId));

        assertEquals(ErrorCode.E21, exception.getErrorCode());
    }

    @Test
    void subscribe_PublicActivity_AutoApproves() {
        stubFindActiveActivity();
        when(activityParticipantRepository.existsByActivityIdAndUserId(activityId, participantUserId)).thenReturn(false);
        when(userRepository.findById(participantUserId)).thenReturn(Optional.of(participantUser));

        MessageResponse response = participationService.subscribe(activityId, participantUserId);

        ArgumentCaptor<ActivityParticipant> captor = ArgumentCaptor.forClass(ActivityParticipant.class);
        verify(activityParticipantRepository).save(captor.capture());

        assertEquals("Inscrição realizada com sucesso.", response.message());
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

        participationService.subscribe(activityId, participantUserId);

        ArgumentCaptor<ActivityParticipant> captor = ArgumentCaptor.forClass(ActivityParticipant.class);
        verify(activityParticipantRepository).save(captor.capture());
        assertFalse(captor.getValue().getApproved());
        assertEquals(ParticipationStatus.PENDING, captor.getValue().getStatus());
    }

    @Test
    void subscribe_CompletedActivity_ThrowsE12() {
        activity.setCompletedAt(LocalDateTime.now());
        stubFindActiveActivity();

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.subscribe(activityId, participantUserId));

        assertEquals(ErrorCode.E12, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void subscribe_CreatorTryingToJoin_ThrowsE8() {
        stubFindActiveActivity();

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.subscribe(activityId, creatorId));

        assertEquals(ErrorCode.E8, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void subscribe_DuplicateRegistration_ThrowsE7() {
        stubFindActiveActivity();
        when(activityParticipantRepository.existsByActivityIdAndUserId(activityId, participantUserId)).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.subscribe(activityId, participantUserId));

        assertEquals(ErrorCode.E7, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void subscribe_UserNotFound_ThrowsE4() {
        stubFindActiveActivity();
        when(activityParticipantRepository.existsByActivityIdAndUserId(activityId, participantUserId)).thenReturn(false);
        when(userRepository.findById(participantUserId)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.subscribe(activityId, participantUserId));

        assertEquals(ErrorCode.E4, exception.getErrorCode());
    }

    @Test
    void approveParticipant_AsCreator_ApprovesSuccessfully() {
        participant.setApproved(false);
        participant.setStatus(ParticipationStatus.PENDING);
        stubFindActiveActivity();
        when(activityParticipantRepository.findByIdAndActivityId(participantId, activityId)).thenReturn(Optional.of(participant));
        when(activityParticipantRepository.save(participant)).thenReturn(participant);
        stubMapParticipantResponse(participant);

        ParticipantResponse response = participationService.approveParticipant(
                activityId,
                new ApproveParticipantRequest(participantId, true),
                creatorId
        );

        assertTrue(response.approved());
        assertEquals(ParticipationStatus.APPROVED, participant.getStatus());
        verify(activityParticipantRepository).save(participant);
    }

    @Test
    void approveParticipant_WhenRejected_SetsStatusToRejected() {
        participant.setApproved(false);
        participant.setStatus(ParticipationStatus.PENDING);
        stubFindActiveActivity();
        when(activityParticipantRepository.findByIdAndActivityId(participantId, activityId)).thenReturn(Optional.of(participant));
        when(activityParticipantRepository.save(participant)).thenReturn(participant);
        stubMapParticipantResponse(participant);

        ParticipantResponse response = participationService.approveParticipant(
                activityId,
                new ApproveParticipantRequest(participantId, false),
                creatorId
        );

        assertFalse(response.approved());
        assertEquals(ParticipationStatus.REJECTED, participant.getStatus());
    }

    @Test
    void approveParticipant_NonCreator_ThrowsE16() {
        stubFindActiveActivity();

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.approveParticipant(
                        activityId,
                        new ApproveParticipantRequest(participantId, true),
                        participantUserId
                ));

        assertEquals(ErrorCode.E16, exception.getErrorCode());
        verify(activityParticipantRepository, never()).save(any(ActivityParticipant.class));
    }

    @Test
    void approveParticipant_ParticipantNotFound_ThrowsE22() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByIdAndActivityId(participantId, activityId)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.approveParticipant(
                        activityId,
                        new ApproveParticipantRequest(participantId, true),
                        creatorId
                ));

        assertEquals(ErrorCode.E22, exception.getErrorCode());
    }

    @Test
    void checkIn_Success_ConfirmsParticipation() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        MessageResponse response = participationService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345"));

        assertEquals("Check-in realizado com sucesso", response.message());
        assertNotNull(participant.getConfirmedAt());
        assertEquals(ParticipationStatus.CHECKED_IN, participant.getStatus());
        verify(activityParticipantRepository).save(participant);
        verify(experienceService).applyCheckInExperience(participantUser, creator);
        verify(achievementService).grantFirstCheckIn(participantUser);
    }

    @Test
    void checkIn_TechnologyActivity_GrantsTechAchievement() {
        activity.getType().setName("Tecnologia");
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        participationService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345"));

        verify(achievementService).grantFirstTechCheckIn(participantUser);
    }

    @Test
    void checkIn_NonTechnologyActivity_DoesNotGrantTechAchievement() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        participationService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345"));

        verify(achievementService, never()).grantFirstTechCheckIn(any(User.class));
    }

    @Test
    void checkIn_CompletedActivity_ThrowsE13() {
        activity.setCompletedAt(LocalDateTime.now());
        stubFindActiveActivity();

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345")));

        assertEquals(ErrorCode.E13, exception.getErrorCode());
    }

    @Test
    void checkIn_NotSubscribed_ThrowsE9() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345")));

        assertEquals(ErrorCode.E9, exception.getErrorCode());
    }

    @Test
    void checkIn_NotApproved_ThrowsE9() {
        participant.setStatus(ParticipationStatus.PENDING);
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345")));

        assertEquals(ErrorCode.E9, exception.getErrorCode());
    }

    @Test
    void checkIn_AlreadyConfirmed_ThrowsE11() {
        participant.setConfirmedAt(LocalDateTime.now().minusMinutes(5));
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.checkIn(activityId, participantUserId, new CheckInRequest("ABC12345")));

        assertEquals(ErrorCode.E11, exception.getErrorCode());
    }

    @Test
    void checkIn_WrongConfirmationCode_ThrowsE10() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.checkIn(activityId, participantUserId, new CheckInRequest("ERRADO")));

        assertEquals(ErrorCode.E10, exception.getErrorCode());
    }

    @Test
    void unsubscribe_Success_DeletesParticipant() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        MessageResponse response = participationService.unsubscribe(activityId, participantUserId);

        assertEquals("Inscrição cancelada com sucesso.", response.message());
        verify(activityParticipantRepository).delete(participant);
    }

    @Test
    void unsubscribe_AfterCheckIn_ThrowsE18() {
        participant.setConfirmedAt(LocalDateTime.now().minusMinutes(10));
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.unsubscribe(activityId, participantUserId));

        assertEquals(ErrorCode.E18, exception.getErrorCode());
        verify(activityParticipantRepository, never()).delete(any(ActivityParticipant.class));
    }

    @Test
    void unsubscribe_ParticipantNotFound_ThrowsE22() {
        stubFindActiveActivity();
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class,
                () -> participationService.unsubscribe(activityId, participantUserId));

        assertEquals(ErrorCode.E22, exception.getErrorCode());
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

    private void stubFindActivity() {
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(activity));
    }

    private void stubMapParticipantResponse(ActivityParticipant participant) {
        when(activityQueryService.mapToParticipantResponse(participant))
                .thenAnswer(invocation -> buildParticipantResponse(invocation.getArgument(0)));
    }

    private ParticipantResponse buildParticipantResponse(ActivityParticipant participant) {
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
}
