package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "UserProfileDTO", description = "Dados completos do usuario logado.")
public record UserProfileResponse(

        @Schema(type = "string", format = "uuid")
        UUID id,
        String name,
        String email,
        String cpf,
        String avatar,
        Integer xp,
        Integer level,
        @Schema(description = "Lista de conquistas do usuario.")
        List<AchievementResponse> achievements
) {
}
