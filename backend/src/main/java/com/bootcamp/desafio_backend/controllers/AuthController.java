package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.dtos.UserRegisterDTO;
import com.bootcamp.desafio_backend.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody UserRegisterDTO dto) {
        authService.register(dto);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("{\"message\": \"Usuario cadastrado com sucesso.\"}");
    }
}
