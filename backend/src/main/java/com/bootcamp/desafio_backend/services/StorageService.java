package com.bootcamp.desafio_backend.services;

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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StorageService {

    private final S3Client s3Client;
    private final String bucketName;
    private final String publicUrl;

    public StorageService(
            S3Client s3Client,
            @Value("${aws.s3.bucket}") String bucketName,
            @Value("${app.public-url:http://localhost:8080}") String publicUrl) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.publicUrl = publicUrl;
    }

    public String uploadImage(MultipartFile file, String folder) {
        ensureBucketExists();

        String key = folder + "/" + UUID.randomUUID() + "." + resolveExtension(file.getContentType());

        try {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes())
            );
        } catch (Exception exception) {
            throw new RuntimeException("Erro inesperado", exception);
        }

        return buildFileUrl(key);
    }

    public Optional<StoredImage> findImageByFileName(String fileName) {
        return List.of("activities", "avatars").stream()
                .map(folder -> folder + "/" + fileName)
                .map(this::findImageByKey)
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

    public record StoredImage(byte[] content, String contentType) {
    }
}
