package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.services.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/images")
@Tag(name = "S3")
public class ImageController {

    private final StorageService storageService;

    public ImageController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping("/{fileName}")
    @Operation(summary = "Buscar imagem", description = "Endpoint para buscar uma imagem armazenada no S3/LocalStack.")
    @ApiResponse(responseCode = "200", description = "Imagem retornada com sucesso.",
            content = @Content(schema = @Schema(type = "string", format = "binary")))
    @ApiResponse(responseCode = "404", description = "Imagem não encontrada.")
    public ResponseEntity<byte[]> getImage(
            @Parameter(description = "Nome do arquivo da imagem")
            @PathVariable String fileName) {
        return storageService.findImageByFileName(fileName)
                .map(image -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(resolveContentType(image)))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                        .body(image.content()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private String resolveContentType(StorageService.StoredImage image) {
        return image.contentType() != null && !image.contentType().isBlank()
                ? image.contentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
}
