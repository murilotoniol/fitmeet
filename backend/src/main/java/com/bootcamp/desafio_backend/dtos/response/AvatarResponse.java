package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AvatarUrlDTO", description = "URL ou caminho da imagem de avatar do usuário.")
public record AvatarResponse(
        @Schema(description = "URL do avatar.")
        String avatar
) {
}
