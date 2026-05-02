package com.bootcamp.desafio_backend.dtos.response;

import java.util.List;

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
