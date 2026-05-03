package com.bootcamp.desafio_backend.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.br.CPF;

public record RegisterRequest(

    @NotBlank(message = "Informe os campos obrigatórios corretamente.")
    String name,

    @NotBlank(message = "Informe os campos obrigatórios corretamente.")
    @Email(message = "O formato do e-mail é inválido.")
    String email,

    @NotBlank(message = "Informe os campos obrigatórios corretamente.")
    @CPF(message = "O formato do CPF é inválido.")
    String cpf,

    @NotBlank(message = "Informe os campos obrigatórios corretamente.")
    String password
) {
}