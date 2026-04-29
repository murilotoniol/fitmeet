package com.bootcamp.desafio_backend.exceptions;

public enum ErrorCode {
    E1("Informe os campos obrigatórios corretamente."),
    E2("A imagem deve ser um arquivo PNG ou JPG."),
    E3("O e-mail ou CPF informado já pertence a outro usuário."),
    E4("Usuário não encontrado."),
    E5("Senha incorreta."),
    E6("Esta conta foi desativada e não pode ser utilizada."),
    E7("Você já se registrou nesta atividade."),
    E8("O criador da atividade não pode se inscrever como um participante."),
    E9("Apenas participantes aprovados na atividade podem fazer check-in."),
    E10("Código de confirmação incorreto."),
    E11("Você já confirmou sua participação nesta atividade."),
    E12("Não é possível se inscrever em uma atividade concluída."),
    E13("Não é possível confirmar presença em uma atividade concluída."),
    E14("Apenas o criador da atividade pode editá-la."),
    E15("Apenas o criador da atividade pode exclui-la."),
    E16("Apenas o criador da atividade pode aprovar ou negar participantes."),
    E17("Apenas o criador da atividade pode concluí-la."),
    E18("Não é possível cancelar sua inscrição, pois sua presença já foi confirmada."),
    E19("Autenticação necessária.");

    private final String message;

    ErrorCode(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
