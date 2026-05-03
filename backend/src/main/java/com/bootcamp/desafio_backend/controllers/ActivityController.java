package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.dtos.request.ApproveParticipantRequest;
import com.bootcamp.desafio_backend.dtos.request.CheckInRequest;
import com.bootcamp.desafio_backend.dtos.request.CreateActivityRequest;
import com.bootcamp.desafio_backend.dtos.request.UpdateActivityRequest;
import com.bootcamp.desafio_backend.dtos.response.ActivityPageResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityTypeResponse;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
import com.bootcamp.desafio_backend.security.UserDetailsImpl;
import com.bootcamp.desafio_backend.services.ActivityService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/types")
    public ResponseEntity<List<ActivityTypeResponse>> getActivityTypes() {
        return ResponseEntity.ok(activityService.getActivityTypes());
    }

    @GetMapping
    public ResponseEntity<ActivityPageResponse> getActivities(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) UUID typeId,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "desc") String orderDirection) {
        return ResponseEntity.ok(activityService.getActivitiesInPage(
                userDetails.getUser().getId(),
                page,
                pageSize,
                typeId,
                orderBy,
                orderDirection
        ));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ActivityResponse>> getActivitiesAll(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) UUID typeId,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "desc") String orderDirection) {
        return ResponseEntity.ok(activityService.getActivityAll(
                userDetails.getUser().getId(),
                typeId,
                orderBy,
                orderDirection
        ));
    }

    @GetMapping("/user/creator")
    public ResponseEntity<ActivityPageResponse> getCreatorActivities(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "desc") String orderDirection) {
        return ResponseEntity.ok(activityService.getActivityCreatorInPage(
                userDetails.getUser().getId(),
                page,
                pageSize,
                orderBy,
                orderDirection
        ));
    }

    @GetMapping("/user/creator/all")
    public ResponseEntity<List<ActivityResponse>> getCreatorActivitiesAll(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.getActivityCreatorAll(userDetails.getUser().getId()));
    }

    @GetMapping("/user/participant")
    public ResponseEntity<ActivityPageResponse> getParticipantActivities(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "desc") String orderDirection) {
        return ResponseEntity.ok(activityService.getActivityParticipantInPage(
                userDetails.getUser().getId(),
                page,
                pageSize,
                orderBy,
                orderDirection
        ));
    }

    @GetMapping("/user/participant/all")
    public ResponseEntity<List<ActivityResponse>> getParticipantActivitiesAll(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.getActivityParticipantAll(userDetails.getUser().getId()));
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<ParticipantResponse>> getParticipants(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.getParticipants(id, userDetails.getUser().getId()));
    }

    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ActivityResponse> createActivity(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @ModelAttribute CreateActivityRequest request) {
        ActivityResponse response = activityService.create(userDetails.getUser().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<MessageResponse> subscribe(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(activityService.subscribe(id, userDetails.getUser().getId()));
    }

    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ActivityResponse> updateActivity(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @ModelAttribute UpdateActivityRequest request) {
        return ResponseEntity.ok(activityService.update(id, userDetails.getUser().getId(), request));
    }

    @PutMapping("/{id}/conclude")
    public ResponseEntity<MessageResponse> concludeActivity(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.conclude(id, userDetails.getUser().getId()));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ParticipantResponse> approveParticipant(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ApproveParticipantRequest request) {
        return ResponseEntity.ok(activityService.approveParticipant(id, request, userDetails.getUser().getId()));
    }

    @PutMapping("/{id}/check-in")
    public ResponseEntity<MessageResponse> checkIn(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(activityService.checkIn(id, userDetails.getUser().getId(), request));
    }

    @DeleteMapping("/{id}/unsubscribe")
    public ResponseEntity<MessageResponse> unsubscribe(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.unsubscribe(id, userDetails.getUser().getId()));
    }

    @DeleteMapping("/{id}/delete")
    public ResponseEntity<MessageResponse> deleteActivity(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.delete(id, userDetails.getUser().getId()));
    }
}
