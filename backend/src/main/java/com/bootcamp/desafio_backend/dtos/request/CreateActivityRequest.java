package com.bootcamp.desafio_backend.dtos.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateActivityRequest(

        @NotBlank(message = "Título é obrigatório.")
        String title,

        @NotBlank(message = "Descrição é obrigatória.")
        @Size(max = 255, message = "A descrição deve conter no máximo 255 caracteres.")
        String description,

        @NotNull(message = "O tipo da atividade é obrigatório.")
        @Schema(type = "string", format = "uuid")
        UUID typeId,

        @NotNull(message = "A imagem é obrigatória.")
        @Schema(type = "string", format = "binary")
        MultipartFile image,

        @NotNull(message = "A data da atividade é obrigatória.")
        @FutureOrPresent(message = "A data deve ser no presente ou futuro.")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        @Schema(type = "string", format = "date-time", example = "2026-05-02T18:30:00")
        LocalDateTime scheduledDate,

        @Valid
        @NotNull(message = "O endereço da atividade é obrigatório.")
        ActivityAddressRequest address,

        @NotNull(message = "A privacidade da atividade é obrigatória.")
        Boolean isPrivate
) {
}
