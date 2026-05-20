package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.dtos.request.UpdateUserRequest;
import com.bootcamp.desafio_backend.dtos.response.AvatarResponse;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.PreferenceResponse;
import com.bootcamp.desafio_backend.dtos.response.UserProfileResponse;
import com.bootcamp.desafio_backend.dtos.response.UserResponse;
import com.bootcamp.desafio_backend.security.UserDetailsImpl;
import com.bootcamp.desafio_backend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import java.util.UUID;

@RestController
@RequestMapping(value = "/user", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Usuários")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Buscar dados do usuário", description = "Endpoint para buscar os dados do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dados retornados com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = UserProfileResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<UserProfileResponse> getUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserProfileResponse profile = userService.getUserProfile(userDetails.getUser().getId());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/preferences")
    @Operation(summary = "Buscar interesses do usuário", description = "Endpoint para buscar os interesses do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Preferências retornadas com sucesso."),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<List<PreferenceResponse>> getUserPreferences(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<PreferenceResponse> preferences = userService.getUserPreferences(userDetails.getUser().getId());
        return ResponseEntity.ok(preferences);
    }

    @PostMapping("/preferences/define")
    @Operation(summary = "Definir preferências do usuário", description = "Endpoint para definir as preferências do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Preferências atualizadas com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = MessageResponse.class),
                            examples = @ExampleObject(value = "{\"message\":\"Preferências atualizadas com sucesso.\"}"))),
            @ApiResponse(responseCode = "400", description = "Campos obrigatórios não informados ou IDs inválidos.",
                    content = @Content(mediaType = "application/json",
                            examples = {
                                    @ExampleObject(name = "Campos obrigatórios", value = "{\"error\":\"Informe os campos obrigatórios corretamente.\"}"),
                                    @ExampleObject(name = "IDs inválidos", value = "{\"error\":\"Informe os campos obrigatórios corretamente.\"}")
                            })),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<MessageResponse> definePreferences(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(array = @ArraySchema(schema = @Schema(type = "string", format = "uuid")))
            )
            @RequestBody List<UUID> activityTypeIds) {
        userService.definePreferences(userDetails.getUser().getId(), activityTypeIds);
        return ResponseEntity.ok(new MessageResponse("Preferências atualizadas com sucesso."));
    }

    @PutMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Editar foto de perfil do usuário", description = "Endpoint para atualizar a foto de perfil do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Avatar atualizado com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = AvatarResponse.class))),
            @ApiResponse(responseCode = "400", description = "Arquivo de imagem inválido.",
                    content = @Content(mediaType = "application/json",
                            examples = {
                                    @ExampleObject(name = "Arquivo de imagem inválido", value = "{\"error\":\"A imagem deve ser um arquivo PNG ou JPG.\"}"),
                                    @ExampleObject(name = "Campos obrigatórios", value = "{\"error\":\"Informe os campos obrigatórios corretamente.\"}")
                            })),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<AvatarResponse> updateAvatar(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Parameter(schema = @Schema(type = "string", format = "binary"))
            @RequestParam("avatar") MultipartFile file) {
        AvatarResponse response = userService.updateAvatar(userDetails.getUser().getId(), file);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    @Operation(summary = "Editar dados do usuário", description = "Endpoint para editar dados do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dados atualizados com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = UserResponse.class))),
            @ApiResponse(responseCode = "400", description = "Campos obrigatórios não informados.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Informe os campos obrigatórios corretamente.\"}"))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "409", description = "E-mail já pertence a outro usuário.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"O e-mail ou CPF informado já pertence a outro usuário.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<UserResponse> updateUser(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deactivate")
    @Operation(summary = "Desativar conta do usuário", description = "Endpoint para desativar a conta do usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Conta desativada com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = MessageResponse.class),
                            examples = @ExampleObject(value = "{\"message\":\"Conta desativada com sucesso\"}"))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<MessageResponse> deactivateUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        userService.deactivateUser(userDetails.getUser().getId());
        return ResponseEntity.ok(new MessageResponse("Conta desativada com sucesso"));
    }
}
