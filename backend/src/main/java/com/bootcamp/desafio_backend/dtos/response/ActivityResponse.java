package com.bootcamp.desafio_backend.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityResponse(
        UUID id,
        String title,
        String description,
        ActivityTypeResponse type,
        LocalDateTime scheduledAt,
        Integer currentParticipants,
        UserResponse creator

) {
}
