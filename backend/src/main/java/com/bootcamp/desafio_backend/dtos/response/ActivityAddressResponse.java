package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AddressDTO", description = "Coordenadas da atividade.")
public record ActivityAddressResponse(

        Double latitude,
        Double longitude
) {
}
