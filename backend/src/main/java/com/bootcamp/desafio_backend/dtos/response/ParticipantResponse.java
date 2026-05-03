package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "ActivityParticipantDataDTO", description = "Dados de um participante vinculado a uma atividade.")
public record ParticipantResponse(

        @Schema(type = "string", format = "uuid")
        UUID id,
        UserResponse user,
        Boolean approved,
        Boolean checkedIn,
        @Schema(type = "string", format = "date-time")
        LocalDateTime registeredAt
) {
}
