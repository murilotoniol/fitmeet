package com.bootcamp.desafio_backend.dtos.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record DefinePreferencesRequest(

        @NotEmpty(message = "A lista de preferencias e obrigatoria.")
        List<UUID> activityTypeIds
) {
}