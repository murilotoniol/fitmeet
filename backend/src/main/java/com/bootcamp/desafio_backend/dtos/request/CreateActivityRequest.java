package com.bootcamp.desafio_backend.dtos.request;

import java.util.Date;
import java.util.UUID;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateActivityRequest(

        @NotBlank(message = "Título é obrigatório.")
        String title,

        @NotBlank(message = "Descrição é obrigatória.")
        @Size(max = 255, message = "A descrição deve conter no máximo 255 caracteres.")
        String description,

        @NotNull(message = "O tipo de atividade é obrigatório.")
        UUID activityTypeId,

        String image,

        @NotNull(message = "A data da atividade é obrigatória.")
        @FutureOrPresent(message = "A data deve ser no presente ou futuro.")
        Date scheduleDate,

        Boolean isPrivate
) {
}
