package com.bootcamp.desafio_backend.dtos.response;

import java.util.UUID;

public record AchievementResponse(

        UUID id,
        String name,
        String criterion
) {
}
