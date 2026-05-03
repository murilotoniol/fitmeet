package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "ActivityCreatorDTO", description = "Dados resumidos do criador da atividade.")
public record ActivityCreatorResponse(

        @Schema(type = "string", format = "uuid")
        UUID id,
        String name,
        String avatar
) {
}
