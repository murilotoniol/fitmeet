package com.bootcamp.desafio_backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.UUID;

@Service
public class StorageService {

    private final S3Client s3Client;
    private final String bucketName;
    private final String endpoint;
    private final String region;

    public StorageService(
            S3Client s3Client,
            @Value("${aws.s3.bucket}") String bucketName,
            @Value("${aws.s3.endpoint}") String endpoint,
            @Value("${aws.region}") String region) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.endpoint = endpoint;
        this.region = region;
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
        if (endpoint != null && !endpoint.isBlank()) {
            return endpoint.replaceAll("/$", "") + "/" + bucketName + "/" + key;
        }

        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;
    }
}
