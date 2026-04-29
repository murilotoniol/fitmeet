package com.bootcamp.desafio_backend.dtos.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record DefinePreferencesRequest(

        @NotNull(message = "A lista de preferências é obrigatória.")
        List<UUID> activityTypeIds
) {
}