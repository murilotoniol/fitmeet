package com.bootcamp.desafio_backend.dtos.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(name = "PaginatedActivitiesDTO", description = "Resposta paginada da listagem de atividades.")
public record ActivityPageResponse(

        int page,
        int pageSize,
        long totalActivities,
        int totalPages,
        Integer previous,
        Integer next,
        List<ActivityResponse> activities
) {
}
