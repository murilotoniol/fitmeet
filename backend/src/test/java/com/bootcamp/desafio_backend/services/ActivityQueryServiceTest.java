package com.bootcamp.desafio_backend.services;

import com.bootcamp.desafio_backend.dtos.response.ActivityPageResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityTypeResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityQueryServiceTest {

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

    private ActivityQueryService activityQueryService;

    private UUID creatorId;
    private UUID participantUserId;
    private UUID activityId;
    private UUID participantId;
    private User creator;
    private User participantUser;
    private Activity activity;
    private ActivityType activityType;
    private ActivityParticipant participant;

    @BeforeEach
    void setUp() {
        creatorId = UUID.randomUUID();
        participantUserId = UUID.randomUUID();
        activityId = UUID.randomUUID();
        participantId = UUID.randomUUID();

        creator = buildUser(creatorId, "Criador", "criador@test.com");
        participantUser = buildUser(participantUserId, "Participante", "participante@test.com");

        activityType = new ActivityType();
        activityType.setId(UUID.randomUUID());
        activityType.setName("Esporte");
        activityType.setDescription("Atividades esportivas");
        activityType.setImage("esporte.png");

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

        activityQueryService = new ActivityQueryService(
                activityRepository,
                activityTypeRepository,
                activityAddressRepository,
                activityParticipantRepository,
                preferenceRepository
        );
    }

    @Test
    void getActivityTypes_ReturnsMappedTypes() {
        ActivityType type2 = new ActivityType();
        type2.setId(UUID.randomUUID());
        type2.setName("Tecnologia");
        type2.setDescription("Atividades de tecnologia");
        type2.setImage("tech.png");

        when(activityTypeRepository.findAll(Sort.by("name").ascending())).thenReturn(List.of(activityType, type2));

        List<ActivityTypeResponse> responses = activityQueryService.getActivityTypes();

        assertEquals(2, responses.size());
        assertEquals(activityType.getId(), responses.get(0).id());
        assertEquals("Esporte", responses.get(0).name());
        assertEquals("Atividades esportivas", responses.get(0).description());
        assertEquals("esporte.png", responses.get(0).image());
        assertEquals("Tecnologia", responses.get(1).name());
    }

    @Test
    void getActivityTypes_EmptyList_ReturnsEmpty() {
        when(activityTypeRepository.findAll(Sort.by("name").ascending())).thenReturn(List.of());

        List<ActivityTypeResponse> responses = activityQueryService.getActivityTypes();

        assertTrue(responses.isEmpty());
    }

    @Test
    void getActivitiesInPage_WithTypeFilter_UsesRepositoryPagination() {
        UUID typeId = activityType.getId();
        Page<Activity> page = new PageImpl<>(
                List.of(activity),
                PageRequest.of(0, 10),
                1
        );

        when(activityRepository.findByType_IdAndDeletedAtIsNullAndCompletedAtIsNull(eq(typeId), any(PageRequest.class)))
                .thenReturn(page);
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityQueryService.getActivitiesInPage(
                participantUserId, 1, 10, typeId, "createdAt", "desc"
        );

        assertEquals(1, response.page());
        assertEquals(10, response.pageSize());
        assertEquals(1, response.totalActivities());
        assertEquals(1, response.activities().size());
        assertEquals(activityId, response.activities().get(0).id());
        verify(preferenceRepository, never()).findByUserId(participantUserId);
    }

    @Test
    void getActivitiesInPage_WithoutTypeFilter_PrioritizesByInterest() {
        UUID preferredTypeId = UUID.randomUUID();
        ActivityType preferredType = new ActivityType();
        preferredType.setId(preferredTypeId);
        preferredType.setName("Tecnologia");

        Activity preferredActivity = buildActivity(preferredType, "Preferida");
        Activity nonPreferredActivity = buildActivity(activityType, "Normal");

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

        ActivityPageResponse response = activityQueryService.getActivitiesInPage(
                participantUserId, 1, 10, null, "createdAt", "desc"
        );

        assertEquals(2, response.activities().size());
        assertEquals(preferredActivity.getId(), response.activities().get(0).id());
        assertEquals(nonPreferredActivity.getId(), response.activities().get(1).id());
    }

    @Test
    void getActivitiesInPage_WithoutPreferences_KeepsOriginalOrder() {
        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of());
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of(activity));
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(0);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityQueryService.getActivitiesInPage(
                participantUserId, 1, 10, null, "createdAt", "desc"
        );

        assertEquals(1, response.activities().size());
        assertEquals(activityId, response.activities().get(0).id());
    }

    @Test
    void getActivitiesInPage_PaginationBeyondData_ReturnsEmptyPage() {
        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of());
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of(activity));

        ActivityPageResponse response = activityQueryService.getActivitiesInPage(
                participantUserId, 5, 10, null, "createdAt", "desc"
        );

        assertTrue(response.activities().isEmpty());
    }

    @Test
    void getActivitiesInPage_PageZero_NormalizesToFirstPage() {
        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of());
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of(activity));
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(0);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityQueryService.getActivitiesInPage(
                participantUserId, 0, 10, null, "createdAt", "desc"
        );

        assertEquals(1, response.page());
        assertEquals(1, response.activities().size());
    }

    @Test
    void getActivityAll_WithTypeFilter_FiltersCorrectly() {
        UUID typeId = activityType.getId();
        when(activityRepository.findByType_IdAndDeletedAtIsNullAndCompletedAtIsNull(eq(typeId), any(Sort.class)))
                .thenReturn(List.of(activity));
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(0);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        List<ActivityResponse> responses = activityQueryService.getActivityAll(
                participantUserId, typeId, "createdAt", "desc"
        );

        assertEquals(1, responses.size());
        assertEquals(activityId, responses.get(0).id());
        verify(preferenceRepository, never()).findByUserId(participantUserId);
    }

    @Test
    void getActivityAll_WithoutTypeFilter_PrioritizesByInterest() {
        UUID preferredTypeId = UUID.randomUUID();
        ActivityType preferredType = new ActivityType();
        preferredType.setId(preferredTypeId);
        preferredType.setName("Tecnologia");

        Activity preferredActivity = buildActivity(preferredType, "Preferida");

        Preference preference = new Preference();
        preference.setUser(participantUser);
        preference.setType(preferredType);

        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of(preference));
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of(activity, preferredActivity));
        when(activityParticipantRepository.countByActivityId(any())).thenReturn(0);
        when(activityAddressRepository.findByActivityId(any())).thenReturn(Optional.empty());

        List<ActivityResponse> responses = activityQueryService.getActivityAll(
                participantUserId, null, "createdAt", "desc"
        );

        assertEquals(2, responses.size());
        assertEquals(preferredActivity.getId(), responses.get(0).id());
    }

    @Test
    void getActivityCreatorInPage_ReturnsMappedActivities() {
        Page<Activity> page = new PageImpl<>(
                List.of(activity),
                PageRequest.of(0, 10),
                1
        );

        when(activityRepository.findByCreatorIdAndDeletedAtIsNull(eq(creatorId), any(PageRequest.class)))
                .thenReturn(page);
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(2);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityQueryService.getActivityCreatorInPage(
                creatorId, 1, 10, "createdAt", "desc"
        );

        assertEquals(1, response.page());
        assertEquals(1, response.activities().size());
        assertNotNull(response.activities().get(0).confirmationCode());
        assertEquals("ABC12345", response.activities().get(0).confirmationCode());
    }

    @Test
    void getActivityCreatorInPage_DoesNotResolveSubscriptionStatus() {
        Page<Activity> page = new PageImpl<>(
                List.of(activity),
                PageRequest.of(0, 10),
                1
        );

        when(activityRepository.findByCreatorIdAndDeletedAtIsNull(eq(creatorId), any(PageRequest.class)))
                .thenReturn(page);
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(0);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityQueryService.getActivityCreatorInPage(
                creatorId, 1, 10, "createdAt", "desc"
        );

        assertNull(response.activities().get(0).userSubscriptionStatus());
    }

    @Test
    void getActivityCreatorAll_ReturnsMappedActivities() {
        when(activityRepository.findByCreatorIdAndDeletedAtIsNull(eq(creatorId), any(Sort.class)))
                .thenReturn(List.of(activity));
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        List<ActivityResponse> responses = activityQueryService.getActivityCreatorAll(creatorId);

        assertEquals(1, responses.size());
        assertEquals(activityId, responses.get(0).id());
        assertNotNull(responses.get(0).confirmationCode());
    }

    @Test
    void getActivityParticipantInPage_ReturnsMappedActivities() {
        Page<ActivityParticipant> page = new PageImpl<>(
                List.of(participant),
                PageRequest.of(0, 10),
                1
        );

        when(activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(eq(participantUserId), any(PageRequest.class)))
                .thenReturn(page);
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityQueryService.getActivityParticipantInPage(
                participantUserId, 1, 10, "createdAt", "desc"
        );

        assertEquals(1, response.page());
        assertEquals(1, response.activities().size());
        assertEquals(ParticipationStatus.APPROVED, response.activities().get(0).userSubscriptionStatus());
    }

    @Test
    void getActivityParticipantInPage_CheckedInParticipant_ShowsCheckedInStatus() {
        participant.setConfirmedAt(LocalDateTime.now().minusMinutes(5));

        Page<ActivityParticipant> page = new PageImpl<>(
                List.of(participant),
                PageRequest.of(0, 10),
                1
        );

        when(activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(eq(participantUserId), any(PageRequest.class)))
                .thenReturn(page);
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityQueryService.getActivityParticipantInPage(
                participantUserId, 1, 10, "createdAt", "desc"
        );

        assertEquals(ParticipationStatus.CHECKED_IN, response.activities().get(0).userSubscriptionStatus());
    }

    @Test
    void getActivityParticipantAll_ReturnsMappedActivities() {
        when(activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(eq(participantUserId), any(Sort.class)))
                .thenReturn(List.of(participant));
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        List<ActivityResponse> responses = activityQueryService.getActivityParticipantAll(participantUserId);

        assertEquals(1, responses.size());
        assertEquals(activityId, responses.get(0).id());
        assertEquals(ParticipationStatus.APPROVED, responses.get(0).userSubscriptionStatus());
    }

    @Test
    void mapToActivityResponse_WithConfirmationCode_IncludesCode() {
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(3);

        ActivityResponse response = activityQueryService.mapToActivityResponse(activity, true);

        assertEquals("ABC12345", response.confirmationCode());
        assertEquals(3, response.participantCount());
        assertEquals(creatorId, response.creator().id());
    }

    @Test
    void mapToActivityResponse_WithoutConfirmationCode_ExcludesCode() {
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(0);

        ActivityResponse response = activityQueryService.mapToActivityResponse(activity, false);

        assertNull(response.confirmationCode());
    }

    @Test
    void mapToActivityResponse_WithUserId_ResolvesSubscriptionStatus() {
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(1);
        when(activityParticipantRepository.findByActivityIdAndUserId(activityId, participantUserId))
                .thenReturn(Optional.of(participant));

        ActivityResponse response = activityQueryService.mapToActivityResponse(activity, false, participantUserId);

        assertEquals(ParticipationStatus.APPROVED, response.userSubscriptionStatus());
    }

    @Test
    void mapToActivityResponse_WithoutUserId_NullSubscriptionStatus() {
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(0);

        ActivityResponse response = activityQueryService.mapToActivityResponse(activity, false, null);

        assertNull(response.userSubscriptionStatus());
    }

    @Test
    void mapToParticipantResponse_MapsCorrectly() {
        ParticipantResponse response = activityQueryService.mapToParticipantResponse(participant);

        assertEquals(participantId, response.id());
        assertEquals(participantUserId, response.user().id());
        assertEquals("Participante", response.user().name());
        assertTrue(response.approved());
        assertFalse(response.checkedIn());
        assertNotNull(response.registeredAt());
    }

    @Test
    void mapToParticipantResponse_CheckedIn_ReturnsCheckedInTrue() {
        participant.setConfirmedAt(LocalDateTime.now());

        ParticipantResponse response = activityQueryService.mapToParticipantResponse(participant);

        assertTrue(response.checkedIn());
    }

    @Test
    void getActivitiesInPage_OrderByType_UsesTypeName() {
        ArgumentCaptor<Sort> sortCaptor = ArgumentCaptor.forClass(Sort.class);

        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of());
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of());

        activityQueryService.getActivitiesInPage(
                participantUserId, 1, 10, null, "type", "asc"
        );

        verify(activityRepository).findByDeletedAtIsNullAndCompletedAtIsNull(sortCaptor.capture());
        Sort.Order order = sortCaptor.getValue().getOrderFor("type.name");
        assertNotNull(order);
        assertTrue(order.isAscending());
    }

    @Test
    void getActivitiesInPage_InvalidOrderBy_FallsBackToCreatedAt() {
        ArgumentCaptor<Sort> sortCaptor = ArgumentCaptor.forClass(Sort.class);

        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of());
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of());

        activityQueryService.getActivitiesInPage(
                participantUserId, 1, 10, null, "invalid", "asc"
        );

        verify(activityRepository).findByDeletedAtIsNullAndCompletedAtIsNull(sortCaptor.capture());
        Sort.Order order = sortCaptor.getValue().getOrderFor("createdAt");
        assertNotNull(order);
    }

    @Test
    void getActivitiesInPage_NullOrderBy_FallsBackToCreatedAt() {
        ArgumentCaptor<Sort> sortCaptor = ArgumentCaptor.forClass(Sort.class);

        when(preferenceRepository.findByUserId(participantUserId)).thenReturn(List.of());
        when(activityRepository.findByDeletedAtIsNullAndCompletedAtIsNull(any(Sort.class)))
                .thenReturn(List.of());

        activityQueryService.getActivitiesInPage(
                participantUserId, 1, 10, null, null, "desc"
        );

        verify(activityRepository).findByDeletedAtIsNullAndCompletedAtIsNull(sortCaptor.capture());
        Sort.Order order = sortCaptor.getValue().getOrderFor("createdAt");
        assertNotNull(order);
        assertFalse(order.isAscending());
    }

    @Test
    void getActivityParticipantInPage_OrderByType_UsesNestedActivityProperty() {
        Page<ActivityParticipant> page = new PageImpl<>(
                List.of(),
                PageRequest.of(0, 10),
                0
        );
        ArgumentCaptor<PageRequest> pageableCaptor = ArgumentCaptor.forClass(PageRequest.class);

        when(activityParticipantRepository.findByUserIdAndActivityDeletedAtIsNull(eq(participantUserId), any(PageRequest.class)))
                .thenReturn(page);

        activityQueryService.getActivityParticipantInPage(
                participantUserId, 1, 10, "type", "asc"
        );

        verify(activityParticipantRepository).findByUserIdAndActivityDeletedAtIsNull(eq(participantUserId), pageableCaptor.capture());
        Sort.Order order = pageableCaptor.getValue().getSort().getOrderFor("activity.type.name");
        assertNotNull(order);
        assertTrue(order.isAscending());
    }

    @Test
    void getActivitiesInPage_MultiplePagesWithPreviousAndNext() {
        UUID typeId = activityType.getId();

        Page<Activity> page = new PageImpl<>(
                List.of(activity),
                PageRequest.of(1, 1),
                3
        );

        when(activityRepository.findByType_IdAndDeletedAtIsNullAndCompletedAtIsNull(eq(typeId), any(PageRequest.class)))
                .thenReturn(page);
        when(activityParticipantRepository.countByActivityId(activityId)).thenReturn(0);
        when(activityAddressRepository.findByActivityId(activityId)).thenReturn(Optional.empty());

        ActivityPageResponse response = activityQueryService.getActivitiesInPage(
                participantUserId, 2, 1, typeId, "createdAt", "desc"
        );

        assertEquals(2, response.page());
        assertEquals(1, response.previous());
        assertEquals(3, response.next());
        assertEquals(3, response.totalPages());
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

    private Activity buildActivity(ActivityType type, String title) {
        Activity act = new Activity();
        act.setId(UUID.randomUUID());
        act.setTitle(title);
        act.setDescription("Descricao " + title);
        act.setType(type);
        act.setImage("image.png");
        act.setScheduledDate(LocalDateTime.now().plusDays(1));
        act.setCreatedAt(LocalDateTime.now().minusDays(1));
        act.setPrivate(false);
        act.setCreator(creator);
        return act;
    }
}