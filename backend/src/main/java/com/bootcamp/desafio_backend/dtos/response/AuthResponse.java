package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AuthDataDTO", description = "Dados de autenticação retornados após cadastro ou login.")
public record AuthResponse(

        @Schema(description = "Token JWT de autenticação.")
        String token,

        @Schema(description = "Dados resumidos do usuário autenticado.")
        UserResponse user
) {
}
