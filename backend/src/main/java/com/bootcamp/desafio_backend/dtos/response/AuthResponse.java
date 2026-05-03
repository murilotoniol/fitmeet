package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AuthDataDTO", description = "Dados de autenticacao retornados apos cadastro ou login.")
public record AuthResponse(

        @Schema(description = "Token JWT de autenticacao.")
        String token,

        @Schema(description = "Dados resumidos do usuario autenticado.")
        UserResponse user
) {
}
