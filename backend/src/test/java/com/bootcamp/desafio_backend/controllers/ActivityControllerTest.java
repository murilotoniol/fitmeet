package com.bootcamp.desafio_backend.controllers;

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
import com.bootcamp.desafio_backend.enums.ParticipationStatus;
import com.bootcamp.desafio_backend.models.User;
import com.bootcamp.desafio_backend.security.UserDetailsImpl;
import com.bootcamp.desafio_backend.services.ActivityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActivityControllerTest {

    @Mock
    private ActivityService activityService;

    @InjectMocks
    private ActivityController activityController;

    private UUID userId;
    private UUID activityId;
    private UserDetailsImpl userDetails;
    private ActivityResponse activityResponse;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        activityId = UUID.randomUUID();

        User user = new User();
        user.setId(userId);
        user.setName("Test User");
        user.setEmail("test@test.com");
        user.setCpf("12345678901");

        userDetails = new UserDetailsImpl(user);

        activityResponse = new ActivityResponse(
                activityId,
                "Corrida",
                "Corrida no parque",
                "Esporte",
                "corrida.png",
                "ABC12345",
                3,
                new ActivityAddressResponse(-23.5, -46.6),
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().minusDays(1),
                null,
                false,
                new ActivityCreatorResponse(userId, "Test User", null),
                ParticipationStatus.APPROVED
        );
    }

    @Test
    void getActivityTypes_ReturnsOk() {
        List<ActivityTypeResponse> responses = List.of(
                new ActivityTypeResponse(UUID.randomUUID(), "Esporte", "Atividades esportivas", "image.png")
        );
        when(activityService.getActivityTypes()).thenReturn(responses);

        ResponseEntity<List<ActivityTypeResponse>> response = activityController.getActivityTypes();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(activityService).getActivityTypes();
    }

    @Test
    void getParticipantActivities_ReturnsOk() {
        ActivityPageResponse pageResponse = new ActivityPageResponse(1, 10, 1, 1, null, null, List.of(activityResponse));
        when(activityService.getActivityParticipantInPage(userId, 1, 10, "createdAt", "desc")).thenReturn(pageResponse);

        ResponseEntity<ActivityPageResponse> response = activityController.getParticipantActivities(
                userDetails,
                1,
                10,
                "createdAt",
                "desc"
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().activities().size());
        verify(activityService).getActivityParticipantInPage(userId, 1, 10, "createdAt", "desc");
    }

    @Test
    void getParticipantActivitiesAll_ReturnsOk() {
        when(activityService.getActivityParticipantAll(userId)).thenReturn(List.of(activityResponse));

        ResponseEntity<List<ActivityResponse>> response = activityController.getParticipantActivitiesAll(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(activityService).getActivityParticipantAll(userId);
    }

    @Test
    void getParticipants_ReturnsOk() {
        ParticipantResponse participantResponse = new ParticipantResponse(
                UUID.randomUUID(),
                new UserResponse(UUID.randomUUID(), "Participante", "p@test.com", "12345678901", null, 0, 1),
                true,
                false,
                null
        );
        when(activityService.getParticipants(activityId, userId)).thenReturn(List.of(participantResponse));

        ResponseEntity<List<ParticipantResponse>> response = activityController.getParticipants(activityId, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(activityService).getParticipants(activityId, userId);
    }

    @Test
    void createActivity_ReturnsCreated() {
        CreateActivityRequest request = new CreateActivityRequest(
                "Corrida",
                "Corrida no parque",
                UUID.randomUUID(),
                new MockMultipartFile("image", "corrida.png", "image/png", "img".getBytes()),
                LocalDateTime.now().plusDays(1),
                new ActivityAddressRequest("Rua A", "10", "Centro", "Sao Paulo", "SP", -23.5, -46.6),
                false
        );
        when(activityService.create(userId, request)).thenReturn(activityResponse);

        ResponseEntity<ActivityResponse> response = activityController.createActivity(userDetails, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(activityService).create(userId, request);
    }

    @Test
    void subscribe_ReturnsCreated() {
        when(activityService.subscribe(activityId, userId)).thenReturn(new MessageResponse("Inscricao realizada com sucesso"));

        ResponseEntity<MessageResponse> response = activityController.subscribe(activityId, userDetails);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Inscricao realizada com sucesso", response.getBody().message());
        verify(activityService).subscribe(activityId, userId);
    }

    @Test
    void updateActivity_ReturnsOk() {
        UpdateActivityRequest request = new UpdateActivityRequest(
                "Corrida Atualizada",
                "Nova descricao",
                UUID.randomUUID(),
                new MockMultipartFile("image", "nova.png", "image/png", "img".getBytes()),
                LocalDateTime.now().plusDays(2),
                new ActivityAddressRequest("Rua B", "20", "Bairro", "Sao Paulo", "SP", -23.6, -46.7),
                true
        );
        when(activityService.update(activityId, userId, request)).thenReturn(activityResponse);

        ResponseEntity<ActivityResponse> response = activityController.updateActivity(activityId, userDetails, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        verify(activityService).update(activityId, userId, request);
    }

    @Test
    void concludeActivity_ReturnsOk() {
        when(activityService.conclude(activityId, userId)).thenReturn(new MessageResponse("Atividade concluida com sucesso"));

        ResponseEntity<MessageResponse> response = activityController.concludeActivity(activityId, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Atividade concluida com sucesso", response.getBody().message());
        verify(activityService).conclude(activityId, userId);
    }

    @Test
    void approveParticipant_ReturnsOk() {
        ApproveParticipantRequest request = new ApproveParticipantRequest(UUID.randomUUID(), true);
        ParticipantResponse participantResponse = new ParticipantResponse(
                request.participantId(),
                new UserResponse(UUID.randomUUID(), "Participante", "p@test.com", "12345678901", null, 0, 1),
                true,
                false,
                null
        );
        when(activityService.approveParticipant(activityId, request, userId)).thenReturn(participantResponse);

        ResponseEntity<ParticipantResponse> response = activityController.approveParticipant(activityId, userDetails, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().approved());
        verify(activityService).approveParticipant(activityId, request, userId);
    }

    @Test
    void checkIn_ReturnsOk() {
        CheckInRequest request = new CheckInRequest("ABC12345");
        when(activityService.checkIn(activityId, userId, request)).thenReturn(new MessageResponse("Check-in realizado com sucesso"));

        ResponseEntity<MessageResponse> response = activityController.checkIn(activityId, userDetails, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Check-in realizado com sucesso", response.getBody().message());
        verify(activityService).checkIn(activityId, userId, request);
    }

    @Test
    void unsubscribe_ReturnsOk() {
        when(activityService.unsubscribe(activityId, userId)).thenReturn(new MessageResponse("Inscricao cancelada com sucesso"));

        ResponseEntity<MessageResponse> response = activityController.unsubscribe(activityId, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Inscricao cancelada com sucesso", response.getBody().message());
        verify(activityService).unsubscribe(activityId, userId);
    }

    @Test
    void deleteActivity_ReturnsOk() {
        when(activityService.delete(activityId, userId)).thenReturn(new MessageResponse("Atividade desativada com sucesso"));

        ResponseEntity<MessageResponse> response = activityController.deleteActivity(activityId, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Atividade desativada com sucesso", response.getBody().message());
        verify(activityService).delete(activityId, userId);
    }
}
