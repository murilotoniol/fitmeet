package com.bootcamp.desafio_backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.bootcamp.desafio_backend.dtos.response.ErrorResponse;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException exception) {
        ErrorResponse response = new ErrorResponse(
                exception.getErrorCode().name(),
                exception.getMessage(),
                LocalDateTime.now());

        return ResponseEntity
                .status(exception.getErrorCode().getStatus())
                .body(response);
    }
}
