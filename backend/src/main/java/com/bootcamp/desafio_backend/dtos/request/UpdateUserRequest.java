package com.bootcamp.desafio_backend.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(

        @NotBlank(message = "Informe os campos obrigatórios corretamente.")
        String name,

        @NotBlank(message = "Informe os campos obrigatórios corretamente.")
        @Email(message = "O formato do e-mail é inválido.")
        String email
) {
}
