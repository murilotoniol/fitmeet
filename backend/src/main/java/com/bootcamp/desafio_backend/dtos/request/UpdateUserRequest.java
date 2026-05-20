package com.bootcamp.desafio_backend.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(

        String name,

        @Email(message = "O formato do e-mail é inválido.")
        String email,

        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres.")
        String password
) {
}
