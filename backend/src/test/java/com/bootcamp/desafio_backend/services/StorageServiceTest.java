package com.bootcamp.desafio_backend.services;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.Optional;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StorageServiceTest {

    @Mock
    private S3Client s3Client;

    @TempDir
    Path tempDir;

    @Test
    void uploadImage_SavesFileAndReturnsApiImageUrl() {
        StorageService storageService = new StorageService(
                s3Client,
                "bucket",
                "http://localhost:8080",
                tempDir.toString()
        );
        MockMultipartFile file = new MockMultipartFile("image", "image.png", "image/png", "content".getBytes());

        when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
                .thenReturn(PutObjectResponse.builder().build());

        String url = storageService.uploadImage(file, "activities");

        assertTrue(url.startsWith("http://localhost:8080/images/"));
        assertTrue(url.endsWith(".png"));

        ArgumentCaptor<PutObjectRequest> captor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(captor.capture(), any(RequestBody.class));
        assertEquals("bucket", captor.getValue().bucket());
        assertTrue(captor.getValue().key().startsWith("activities/"));
        assertEquals("image/png", captor.getValue().contentType());
    }

    @Test
    void findImageByFileName_WhenExistsInActivities_ReturnsImage() {
        StorageService storageService = new StorageService(
                s3Client,
                "bucket",
                "http://localhost:8080",
                tempDir.toString()
        );
        byte[] content = "image".getBytes();

        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class))).thenReturn(
                ResponseBytes.fromByteArray(
                        GetObjectResponse.builder().contentType("image/png").build(),
                        content
                )
        );

        Optional<StorageService.StoredImage> image = storageService.findImageByFileName("file.png");

        assertTrue(image.isPresent());
        assertArrayEquals(content, image.get().content());
        assertEquals("image/png", image.get().contentType());

        ArgumentCaptor<GetObjectRequest> captor = ArgumentCaptor.forClass(GetObjectRequest.class);
        verify(s3Client).getObjectAsBytes(captor.capture());
        assertEquals("activities/file.png", captor.getValue().key());
    }

    @Test
    void findImageByFileName_WhenNotFound_ReturnsEmpty() {
        StorageService storageService = new StorageService(
                s3Client,
                "bucket",
                "http://localhost:8080",
                tempDir.toString()
        );

        when(s3Client.getObjectAsBytes(any(GetObjectRequest.class))).thenThrow(
                S3Exception.builder().statusCode(404).build()
        );

        Optional<StorageService.StoredImage> image = storageService.findImageByFileName("missing.png");

        assertFalse(image.isPresent());
    }
}
