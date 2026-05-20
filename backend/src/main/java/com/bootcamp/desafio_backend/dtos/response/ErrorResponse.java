package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ErrorResponseDTO", description = "Resposta padrão para erros da API.")
public record ErrorResponse(
        @Schema(description = "Mensagem de erro.")
        String error
) {
}
