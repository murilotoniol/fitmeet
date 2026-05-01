package com.bootcamp.desafio_backend.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.bootcamp.desafio_backend.dtos.response.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException exception) {

        ErrorCode errorCode = ErrorCode.E1;

        ErrorResponse response = new ErrorResponse(
          errorCode.name(),
          errorCode.getMessage(),
          LocalDateTime.now()
        );

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception exception) {
        ErrorCode errorCode = ErrorCode.E20;

        log.error("Unexpected exception handled by GlobalExceptionHandler", exception);

        ErrorResponse response = new ErrorResponse(
                errorCode.name(),
                errorCode.getMessage(),
                LocalDateTime.now()
        );

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(response);
    }
}
