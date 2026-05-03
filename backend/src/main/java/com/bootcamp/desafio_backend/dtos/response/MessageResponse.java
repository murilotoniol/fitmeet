package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "SuccessResponseDTO", description = "Resposta padrao para operacoes realizadas com sucesso.")
public record MessageResponse(
        @Schema(description = "Mensagem de sucesso.")
        String message
) {
}
