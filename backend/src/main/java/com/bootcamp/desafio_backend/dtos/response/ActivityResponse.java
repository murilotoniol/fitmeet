package com.bootcamp.desafio_backend.dtos.response;

import com.bootcamp.desafio_backend.enums.ParticipationStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityResponse(
        @Schema(type = "string", format = "uuid")
        UUID id,
        String title,
        String description,
        String type,
        String image,
        String confirmationCode,
        Integer participantCount,
        ActivityAddressResponse address,
        @Schema(type = "string", format = "date-time")
        LocalDateTime scheduledDate,
        @Schema(type = "string", format = "date-time")
        LocalDateTime createdAt,
        @Schema(type = "string", format = "date-time")
        LocalDateTime completedAt,
        @Schema(type = "string", format = "date-time")
        LocalDateTime deletedAt,
        boolean isPrivate,
        ActivityCreatorResponse creator,
        ParticipationStatus userSubscriptionStatus
) {
}
