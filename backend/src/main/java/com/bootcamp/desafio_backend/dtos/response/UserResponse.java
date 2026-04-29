package com.bootcamp.desafio_backend.dtos.response;

import java.util.UUID;

public record UserResponse(

        UUID id,
        String name,
        String email,
        String cpf,
        String avatar,
        Integer xp,
        Integer level
) {
}
