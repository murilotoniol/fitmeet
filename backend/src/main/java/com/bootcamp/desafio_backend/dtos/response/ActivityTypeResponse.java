package com.bootcamp.desafio_backend.dtos.response;

import java.util.UUID;

public record ActivityTypeResponse(

        UUID id,
        String name,
        String description,
        String image
) {
}
