package com.bootcamp.desafio_backend.dtos.response;

import java.util.List;

public record ActivityPageResponse(

        List<ActivityResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
