package com.bootcamp.desafio_backend.dtos.response;

import java.util.UUID;

public record ActivityCreatorResponse(

        UUID id,
        String name,
        String avatar
) {
}
