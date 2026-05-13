package com.bootcamp.desafio_backend.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StorageService {

    private static final Logger logger = LoggerFactory.getLogger(StorageService.class);

    private final S3Client s3Client;
    private final String bucketName;
    private final String publicUrl;
    private final Path localStorageRoot;

    public StorageService(
            S3Client s3Client,
            @Value("${aws.s3.bucket}") String bucketName,
            @Value("${app.public-url:http://localhost:8080}") String publicUrl,
            @Value("${app.storage.local-dir:/app/storage}") String localStorageDir) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.publicUrl = publicUrl;
        this.localStorageRoot = Path.of(localStorageDir);
    }

    public String uploadImage(MultipartFile file, String folder) {
        String key = folder + "/" + UUID.randomUUID() + "." + resolveExtension(file.getContentType());
        byte[] bytes;

        try {
            bytes = file.getBytes();
            saveLocally(key, bytes);
        } catch (IOException exception) {
            throw new RuntimeException("Erro inesperado", exception);
        }

        try {
            ensureBucketExists();
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(bytes)
            );
        } catch (Exception exception) {
            logger.warn("Nao foi possivel salvar imagem no S3 local. Mantendo copia local em disco.", exception);
        }

        return buildFileUrl(key);
    }

    public Optional<StoredImage> findImageByFileName(String fileName) {
        return List.of("activities", "avatars").stream()
                .map(folder -> folder + "/" + fileName)
                .map(this::findImage)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .findFirst();
    }

    private void ensureBucketExists() {
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
        } catch (NoSuchBucketException exception) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                s3Client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
                return;
            }
            throw exception;
        }
    }

    private String resolveExtension(String contentType) {
        if ("image/png".equals(contentType)) {
            return "png";
        }
        return "jpg";
    }

    private String buildFileUrl(String key) {
        String fileName = key.substring(key.lastIndexOf("/") + 1);
        return publicUrl.replaceAll("/$", "") + "/images/" + fileName;
    }

    private Optional<StoredImage> findImage(String key) {
        Optional<StoredImage> localImage = findLocalImageByKey(key);

        if (localImage.isPresent()) {
            return localImage;
        }

        return findImageByKey(key);
    }

    private Optional<StoredImage> findImageByKey(String key) {
        try {
            ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(
                    GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build()
            );

            return Optional.of(new StoredImage(response.asByteArray(), response.response().contentType()));
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                return Optional.empty();
            }
            throw exception;
        }
    }

    private void saveLocally(String key, byte[] bytes) throws IOException {
        Path filePath = localStorageRoot.resolve(key).normalize();

        if (filePath.getParent() != null) {
            Files.createDirectories(filePath.getParent());
        }

        Files.write(
                filePath,
                bytes,
                StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING,
                StandardOpenOption.WRITE
        );
    }

    private Optional<StoredImage> findLocalImageByKey(String key) {
        try {
            Path filePath = localStorageRoot.resolve(key).normalize();

            if (!Files.exists(filePath)) {
                return Optional.empty();
            }

            byte[] bytes = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);

            if (contentType == null || contentType.isBlank()) {
                String fileName = filePath.getFileName().toString().toLowerCase();
                contentType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
            }

            return Optional.of(new StoredImage(bytes, contentType));
        } catch (IOException exception) {
            throw new RuntimeException("Erro inesperado", exception);
        }
    }

    public record StoredImage(byte[] content, String contentType) {
    }
}
