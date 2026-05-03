package com.bootcamp.desafio_backend.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(

        @NotBlank(message = "Informe os campos obrigatorios corretamente.")
        String name,

        @NotBlank(message = "Informe os campos obrigatorios corretamente.")
        @Email(message = "O formato do e-mail e invalido.")
        String email,

        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres.")
        String password
) {
}
