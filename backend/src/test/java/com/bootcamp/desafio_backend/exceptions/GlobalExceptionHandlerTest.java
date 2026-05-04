package com.bootcamp.desafio_backend.exceptions;

import com.bootcamp.desafio_backend.dtos.response.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler globalExceptionHandler = new GlobalExceptionHandler();

    @Test
    void handleBusinessException_ReturnsSimplifiedErrorShape() {
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleBusinessException(
                new BusinessException(ErrorCode.E19)
        );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Autenticação necessária.", response.getBody().error());
    }

    @Test
    void handleValidationException_ReturnsSimplifiedErrorShape() {
        MethodArgumentNotValidException exception = mock(MethodArgumentNotValidException.class);

        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleValidationException(exception);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Informe os campos obrigatórios corretamente.", response.getBody().error());
    }

    @Test
    void handleException_ReturnsSimplifiedErrorShape() {
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleException(new RuntimeException("boom"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Erro inesperado.", response.getBody().error());
    }
}
