package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.dtos.request.DefinePreferencesRequest;
import com.bootcamp.desafio_backend.dtos.request.UpdateUserRequest;
import com.bootcamp.desafio_backend.dtos.response.AvatarResponse;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.PreferenceResponse;
import com.bootcamp.desafio_backend.dtos.response.UserProfileResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.security.UserDetailsImpl;
import com.bootcamp.desafio_backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserProfileResponse> getUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserProfileResponse profile = userService.getUserProfile(userDetails.getUser().getId());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/preferences")
    public ResponseEntity<List<PreferenceResponse>> getUserPreferences(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<PreferenceResponse> preferences = userService.getUserPreferences(userDetails.getUser().getId());
        return ResponseEntity.ok(preferences);
    }

    @PostMapping("/preferences/define")
    public ResponseEntity<MessageResponse> definePreferences(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody DefinePreferencesRequest request) {
        userService.definePreferences(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(new MessageResponse("Preferencias atualizadas com sucesso"));
    }

    @PutMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AvatarResponse> updateAvatar(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam("avatar") MultipartFile file) {
        AvatarResponse response = userService.updateAvatar(userDetails.getUser().getId(), file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<UserResponse> updateUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deactivate")
    public ResponseEntity<MessageResponse> deactivateUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        userService.deactivateUser(userDetails.getUser().getId());
        return ResponseEntity.ok(new MessageResponse("Conta desativada com sucesso"));
    }
}
