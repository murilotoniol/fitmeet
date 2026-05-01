package com.bootcamp.desafio_backend.dtos.response;

import java.util.UUID;

public record PreferenceResponse(

        UUID typeId,
        String typeName,
        String typeDescription
) {
}
