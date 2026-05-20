package com.bootcamp.desafio_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class DesafioBackendApplication {

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone(
				System.getenv().getOrDefault("APP_TIME_ZONE", "America/Sao_Paulo")
		));
		SpringApplication.run(DesafioBackendApplication.class, args);
	}

}
