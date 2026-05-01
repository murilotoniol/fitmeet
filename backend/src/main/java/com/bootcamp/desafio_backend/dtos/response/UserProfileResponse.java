package com.bootcamp.desafio_backend.dtos.response;

import java.util.List;
import java.util.UUID;

public record UserProfileResponse(

        UUID id,
        String name,
        String email,
        String cpf,
        String avatar,
        Integer xp,
        Integer level,
        List<AchievementResponse> achievements
) {
}
