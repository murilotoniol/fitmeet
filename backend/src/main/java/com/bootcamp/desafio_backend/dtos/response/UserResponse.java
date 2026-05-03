package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "UserDataDTO", description = "Dados resumidos do usuario.")
public record UserResponse(

        @Schema(type = "string", format = "uuid")
        UUID id,
        String name,
        String email,
        String cpf,
        String avatar,
        Integer xp,
        Integer level
) {
}
