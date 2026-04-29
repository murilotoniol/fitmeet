package com.bootcamp.desafio_backend.dtos.response;

import java.time.LocalDateTime;

public class ErrorResponse {

    private String code;
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponse(String errorCode, String message, LocalDateTime timestamp) {
        this.code = errorCode;
        this.message = message;
        this.timestamp = timestamp;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
