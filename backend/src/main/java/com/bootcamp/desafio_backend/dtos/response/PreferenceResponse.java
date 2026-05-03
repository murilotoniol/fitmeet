package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "UserPreferencesDTO", description = "Tipo de atividade marcado como interesse do usuario.")
public record PreferenceResponse(

        @Schema(type = "string", format = "uuid")
        UUID typeId,
        String typeName,
        String typeDescription
) {
}
