package com.bootcamp.desafio_backend.exceptions;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    E1("Informe os campos obrigatórios corretamente.", HttpStatus.BAD_REQUEST),
    E2("A imagem deve ser um arquivo PNG ou JPG.", HttpStatus.BAD_REQUEST),
    E3("O e-mail ou CPF informado já pertence a outro usuário.", HttpStatus.CONFLICT),
    E4("Usuário não encontrado.", HttpStatus.NOT_FOUND),
    E5("Senha incorreta.", HttpStatus.UNAUTHORIZED),
    E6("Esta conta foi desativada e não pode ser utilizada.", HttpStatus.FORBIDDEN),
    E7("Você já se registrou nesta atividade.", HttpStatus.CONFLICT),
    E8("O criador da atividade não pode se inscrever como um participante.", HttpStatus.FORBIDDEN),
    E9("Apenas participantes aprovados na atividade podem fazer check-in.", HttpStatus.FORBIDDEN),
    E10("Código de confirmação incorreto.", HttpStatus.BAD_REQUEST),
    E11("Você já confirmou sua participação nesta atividade.", HttpStatus.CONFLICT),
    E12("Não é possível se inscrever em uma atividade concluída.", HttpStatus.FORBIDDEN),
    E13("Não é possível confirmar presença em uma atividade concluída.", HttpStatus.FORBIDDEN),
    E14("Apenas o criador da atividade pode editá-la.", HttpStatus.FORBIDDEN),
    E15("Apenas o criador da atividade pode excluí-la.", HttpStatus.FORBIDDEN),
    E16("Apenas o criador da atividade pode aprovar ou negar participantes.", HttpStatus.FORBIDDEN),
    E17("Apenas o criador da atividade pode concluí-la.", HttpStatus.FORBIDDEN),
    E18("Não é possível cancelar sua inscrição, pois sua presença já foi confirmada.", HttpStatus.FORBIDDEN),
    E19("Autenticação necessária.", HttpStatus.UNAUTHORIZED),
    E20("Erro inesperado.", HttpStatus.INTERNAL_SERVER_ERROR),
    E21("Atividade não encontrada.", HttpStatus.NOT_FOUND),
    E22("Participante não encontrado.", HttpStatus.NOT_FOUND);

    private final String message;
    private final HttpStatus status;

    ErrorCode(String message, HttpStatus status) {
        this.message = message;
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
