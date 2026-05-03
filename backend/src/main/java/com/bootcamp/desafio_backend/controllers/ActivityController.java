package com.bootcamp.desafio_backend.controllers;

import com.bootcamp.desafio_backend.dtos.request.ApproveParticipantRequest;
import com.bootcamp.desafio_backend.dtos.request.CheckInRequest;
import com.bootcamp.desafio_backend.dtos.request.CreateActivityRequest;
import com.bootcamp.desafio_backend.dtos.request.UpdateActivityRequest;
import com.bootcamp.desafio_backend.dtos.response.ActivityPageResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityResponse;
import com.bootcamp.desafio_backend.dtos.response.ActivityTypeResponse;
import com.bootcamp.desafio_backend.dtos.response.MessageResponse;
import com.bootcamp.desafio_backend.dtos.response.ParticipantResponse;
import com.bootcamp.desafio_backend.security.UserDetailsImpl;
import com.bootcamp.desafio_backend.services.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/activities", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Atividades")
@SecurityRequirement(name = "bearerAuth")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/types")
    @Operation(summary = "Listar tipos de atividades", description = "Endpoint para listar os tipos de atividades disponíveis.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tipos retornados com sucesso."),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<List<ActivityTypeResponse>> getActivityTypes() {
        return ResponseEntity.ok(activityService.getActivityTypes());
    }

    @GetMapping
    @Operation(summary = "Listar atividades com paginação, filtro por tipo e ordenação",
            description = "Endpoint para listar de forma paginada as atividades registradas.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividades retornadas com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ActivityPageResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<ActivityPageResponse> getActivities(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) UUID typeId,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "desc") String orderDirection) {
        return ResponseEntity.ok(activityService.getActivitiesInPage(
                userDetails.getUser().getId(),
                page,
                pageSize,
                typeId,
                orderBy,
                orderDirection
        ));
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todas as atividades com filtro por tipo e ordenação",
            description = "Endpoint para listar todas as atividades registradas.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividades retornadas com sucesso."),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<List<ActivityResponse>> getActivitiesAll(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) UUID typeId,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "desc") String orderDirection) {
        return ResponseEntity.ok(activityService.getActivityAll(
                userDetails.getUser().getId(),
                typeId,
                orderBy,
                orderDirection
        ));
    }

    @GetMapping("/user/creator")
    @Operation(summary = "Buscar atividades criadas pelo usuário",
            description = "Endpoint para listar de forma paginada as atividades criadas pelo usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividades do criador retornadas com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ActivityPageResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<ActivityPageResponse> getCreatorActivities(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "desc") String orderDirection) {
        return ResponseEntity.ok(activityService.getActivityCreatorInPage(
                userDetails.getUser().getId(),
                page,
                pageSize,
                orderBy,
                orderDirection
        ));
    }

    @GetMapping("/user/creator/all")
    @Operation(summary = "Buscar todas as atividades criadas pelo usuário",
            description = "Endpoint para listar todas as atividades criadas pelo usuário logado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividades do criador retornadas com sucesso."),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<List<ActivityResponse>> getCreatorActivitiesAll(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.getActivityCreatorAll(userDetails.getUser().getId()));
    }

    @GetMapping("/user/participant")
    @Operation(summary = "Buscar atividades em que o usuário se inscreveu",
            description = "Endpoint para listar de forma paginada as atividades em que o usuário logado se inscreveu.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividades do participante retornadas com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ActivityPageResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<ActivityPageResponse> getParticipantActivities(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "createdAt") String orderBy,
            @RequestParam(defaultValue = "desc") String orderDirection) {
        return ResponseEntity.ok(activityService.getActivityParticipantInPage(
                userDetails.getUser().getId(),
                page,
                pageSize,
                orderBy,
                orderDirection
        ));
    }

    @GetMapping("/user/participant/all")
    @Operation(summary = "Buscar todas as atividades em que o usuário se inscreveu",
            description = "Endpoint para listar todas as atividades em que o usuário logado se inscreveu.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividades do participante retornadas com sucesso."),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<List<ActivityResponse>> getParticipantActivitiesAll(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.getActivityParticipantAll(userDetails.getUser().getId()));
    }

    @GetMapping("/{id}/participants")
    @Operation(summary = "Buscar participantes de uma atividade",
            description = "Endpoint para buscar os participantes de uma atividade específica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Participantes retornados com sucesso."),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "403", description = "Apenas o criador pode visualizar os participantes.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Apenas o criador de uma atividade pode aprovar ou negar participantes.\"}"))),
            @ApiResponse(responseCode = "404", description = "Atividade não encontrada.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Atividade não encontrada.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<List<ParticipantResponse>> getParticipants(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.getParticipants(id, userDetails.getUser().getId()));
    }

    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Criar uma atividade", description = "Endpoint para criar uma atividade.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Atividade criada com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ActivityResponse.class))),
            @ApiResponse(responseCode = "400", description = "Arquivo de imagem inválido ou dados obrigatórios ausentes.",
                    content = @Content(mediaType = "application/json",
                            examples = {
                                    @ExampleObject(name = "Imagem inválida", value = "{\"error\":\"A imagem deve ser um arquivo PNG ou JPG.\"}"),
                                    @ExampleObject(name = "Campos obrigatórios", value = "{\"error\":\"Informe os campos obrigatórios corretamente.\"}")
                            })),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<ActivityResponse> createActivity(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @ModelAttribute CreateActivityRequest request) {
        ActivityResponse response = activityService.create(userDetails.getUser().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/subscribe")
    @Operation(summary = "Inscrever-se em uma atividade", description = "Endpoint para inscrever o usuário logado em uma atividade.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Inscrição realizada com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = MessageResponse.class),
                            examples = @ExampleObject(value = "{\"message\":\"Inscricao realizada com sucesso\"}"))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "403", description = "Criador tentando se inscrever ou atividade concluída.",
                    content = @Content(mediaType = "application/json",
                            examples = {
                                    @ExampleObject(name = "Criador não pode participar", value = "{\"error\":\"O criador da atividade não pode se inscrever como um participante.\"}"),
                                    @ExampleObject(name = "Atividade concluída", value = "{\"error\":\"Não é possível se inscrever em uma atividade concluída.\"}")
                            })),
            @ApiResponse(responseCode = "409", description = "Usuário já inscrito na atividade.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Você já se registrou nesta atividade.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<MessageResponse> subscribe(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(activityService.subscribe(id, userDetails.getUser().getId()));
    }

    @PutMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Editar uma atividade existente", description = "Endpoint para editar uma atividade existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividade atualizada com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ActivityResponse.class))),
            @ApiResponse(responseCode = "400", description = "Arquivo de imagem inválido.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"A imagem deve ser um arquivo PNG ou JPG.\"}"))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "403", description = "Apenas o criador pode editar a atividade.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Apenas o criador da atividade pode editá-la.\"}"))),
            @ApiResponse(responseCode = "404", description = "Atividade não encontrada.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Atividade não encontrada.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<ActivityResponse> updateActivity(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @ModelAttribute UpdateActivityRequest request) {
        return ResponseEntity.ok(activityService.update(id, userDetails.getUser().getId(), request));
    }

    @PutMapping("/{id}/conclude")
    @Operation(summary = "Concluir uma atividade", description = "Endpoint para concluir uma atividade.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividade concluida com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = MessageResponse.class),
                            examples = @ExampleObject(value = "{\"message\":\"Atividade concluida com sucesso\"}"))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "403", description = "Apenas o criador pode concluir a atividade.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Apenas o criador de uma atividade pode conclui-la.\"}"))),
            @ApiResponse(responseCode = "404", description = "Atividade não encontrada.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Atividade não encontrada.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<MessageResponse> concludeActivity(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.conclude(id, userDetails.getUser().getId()));
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Aprovar ou negar inscrição de participante em atividade privada",
            description = "Endpoint para aprovar ou negar inscrição de participante em atividade privada.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Solicitacao processada com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ParticipantResponse.class))),
            @ApiResponse(responseCode = "400", description = "Campos obrigatórios não informados.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Informe os campos obrigatórios corretamente.\"}"))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "403", description = "Apenas o criador pode aprovar ou negar participantes.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Apenas o criador de uma atividade pode aprovar ou negar participantes.\"}"))),
            @ApiResponse(responseCode = "404", description = "Atividade ou participante não encontrado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Atividade não encontrada.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<ParticipantResponse> approveParticipant(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ApproveParticipantRequest request) {
        return ResponseEntity.ok(activityService.approveParticipant(id, request, userDetails.getUser().getId()));
    }

    @PutMapping("/{id}/check-in")
    @Operation(summary = "Fazer check-in em uma atividade usando código de confirmação",
            description = "Endpoint para fazer check-in em uma atividade utilizando o código de confirmação.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Check-in realizado com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = MessageResponse.class),
                            examples = @ExampleObject(value = "{\"message\":\"Check-in realizado com sucesso\"}"))),
            @ApiResponse(responseCode = "400", description = "Campos obrigatórios não informados ou código incorreto.",
                    content = @Content(mediaType = "application/json",
                            examples = {
                                    @ExampleObject(name = "Campos obrigatórios", value = "{\"error\":\"Informe os campos obrigatórios corretamente.\"}"),
                                    @ExampleObject(name = "Codigo incorreto", value = "{\"error\":\"Código de confirmação incorreto.\"}")
                            })),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "403", description = "Participante não aprovado ou atividade concluída.",
                    content = @Content(mediaType = "application/json",
                            examples = {
                                    @ExampleObject(name = "Participante não aprovado", value = "{\"error\":\"Apenas participantes aprovados na atividade podem fazer check-in.\"}"),
                                    @ExampleObject(name = "Atividade concluida", value = "{\"error\":\"Não é possível confirmar sua presença em uma atividade concluída.\"}")
                            })),
            @ApiResponse(responseCode = "404", description = "Atividade não encontrada.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Atividade não encontrada.\"}"))),
            @ApiResponse(responseCode = "409", description = "Participação já confirmada.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Você já confirmou sua participação nesta atividade.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<MessageResponse> checkIn(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CheckInRequest request) {
        return ResponseEntity.ok(activityService.checkIn(id, userDetails.getUser().getId(), request));
    }

    @DeleteMapping("/{id}/unsubscribe")
    @Operation(summary = "Cancelar inscrição do usuário em uma atividade",
            description = "Endpoint para cancelar a inscrição do usuário logado em uma atividade.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscrição cancelada com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = MessageResponse.class),
                            examples = @ExampleObject(value = "{\"message\":\"Inscricao cancelada com sucesso\"}"))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "403", description = "Presença já confirmada.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Não é possível cancelar a inscrição, pois sua presença já foi confirmada.\"}"))),
            @ApiResponse(responseCode = "404", description = "Atividade não encontrada.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Atividade não encontrada.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<MessageResponse> unsubscribe(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.unsubscribe(id, userDetails.getUser().getId()));
    }

    @DeleteMapping("/{id}/delete")
    @Operation(summary = "Excluir uma atividade existente", description = "Endpoint para excluir uma atividade existente.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atividade excluida com sucesso.",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = MessageResponse.class),
                            examples = @ExampleObject(value = "{\"message\":\"Atividade desativada com sucesso\"}"))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Autenticação necessária.\"}"))),
            @ApiResponse(responseCode = "403", description = "Apenas o criador pode excluir a atividade.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Apenas o criador de uma atividade pode exclui-la.\"}"))),
            @ApiResponse(responseCode = "404", description = "Atividade não encontrada.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Atividade não encontrada.\"}"))),
            @ApiResponse(responseCode = "500", description = "Erro inesperado.",
                    content = @Content(mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"error\":\"Erro inesperado.\"}")))
    })
    public ResponseEntity<MessageResponse> deleteActivity(
            @Parameter(schema = @Schema(type = "string", format = "uuid"))
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(activityService.delete(id, userDetails.getUser().getId()));
    }
}
