package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.services.StorageService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class ImageControllerTest {

    private final StorageService storageService = mock(StorageService.class);
    private final MockMvc mockMvc = standaloneSetup(new ImageController(storageService)).build();

    @Test
    void getImage_WhenImageExists_ReturnsImageBytes() throws Exception {
        byte[] content = "image".getBytes();
        when(storageService.findImageByFileName("file.png"))
                .thenReturn(Optional.of(new StorageService.StoredImage(content, "image/png")));

        mockMvc.perform(get("/images/file.png"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"file.png\""))
                .andExpect(content().contentType("image/png"))
                .andExpect(content().bytes(content));
    }

    @Test
    void getImage_WhenImageDoesNotExist_ReturnsNotFound() throws Exception {
        when(storageService.findImageByFileName("missing.png")).thenReturn(Optional.empty());

        mockMvc.perform(get("/images/missing.png"))
                .andExpect(status().isNotFound());
    }
}
