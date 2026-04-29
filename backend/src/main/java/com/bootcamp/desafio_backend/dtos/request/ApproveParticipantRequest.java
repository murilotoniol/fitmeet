package com.bootcamp.desafio_backend.dtos.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ApproveParticipantRequest(

        @NotNull(message = "ID do participante é obrigatório")
        UUID participantId,

        @NotNull(message = "Status de aprovação é obrigatório")
        Boolean approved
) {
}
