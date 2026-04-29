package com.bootcamp.desafio_backend.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ParticipantResponse(

        UUID id,
        UserResponse user,
        Boolean approved,
        Boolean checkedIn,
        LocalDateTime registeredAt
) {
}
