package com.bootcamp.desafio_backend.dtos.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.UUID;

public record UpdateActivityRequest(

        String title,

        String description,

        @Schema(type = "string", format = "uuid")
        UUID typeId,

        @Schema(type = "string", format = "binary")
        MultipartFile image,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        @Schema(type = "string", format = "date-time", example = "2026-05-02T18:30:00")
        LocalDateTime scheduledDate,

        @Valid
        ActivityAddressRequest address,

        Boolean isPrivate
) {
}
