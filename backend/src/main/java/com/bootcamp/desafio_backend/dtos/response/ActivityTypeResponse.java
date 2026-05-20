package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "ActivityTypeDTO", description = "Tipo de atividade disponível para filtros e criação.")
public record ActivityTypeResponse(

        @Schema(type = "string", format = "uuid")
        UUID id,
        String name,
        String description,
        String image
) {
}
