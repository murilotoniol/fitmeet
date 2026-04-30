package com.bootcamp.desafio_backend.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ActivityAddressRequest(

        @NotBlank(message = "A rua é obrigatória.")
        String street,

        @NotBlank(message = "O número é obrigatório.")
        String number,

        @NotBlank(message = "O bairro é obrigatório.")
        String neighborhood,

        @NotBlank(message = "A cidade é obrigatória.")
        String city,

        @NotBlank(message = "O estado é obrigatório.")
        String state,

        @NotNull(message = "A latitude é obrigatória.")
        Double latitude,

        @NotNull(message = "A longitude é obrigatória.")
        Double longitude
) {
}
