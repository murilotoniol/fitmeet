package com.bootcamp.desafio_backend.dtos.response;

public record AuthResponse(

        String token,
        UserResponse user
) {
}
