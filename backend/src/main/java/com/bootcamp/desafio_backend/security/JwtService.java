package com.bootcamp.desafio_backend.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.bootcamp.desafio_backend.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private Instant genExpirationDate() {
        return Instant.now().plusMillis(expiration);
    }

    public String generateToken(User user) {
        try {

            Algorithm algorithm = Algorithm.HMAC256(secret);

            return JWT.create()
                    .withIssuer("bootcamp-backend")
                    .withSubject(user.getEmail())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm);

        } catch (JWTCreationException exception) {

            throw new RuntimeException("Erro ao gerar o token JWT", exception);
        }
    }

    public String extractSubject(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);

            return JWT.require(algorithm)
                    .withIssuer("bootcamp-backend")
                    .build()
                    .verify(token)
                    .getSubject();

        } catch (Exception exception) {
            throw new RuntimeException("Token JWT inválido ou expirado", exception);
        }
    }

    public Boolean isTokenValid(String token, User user) {
        try {
            String email = extractSubject(token);
            return email.equals(user.getEmail());
        } catch (Exception exception) {
            return false;
        }
    }
}
