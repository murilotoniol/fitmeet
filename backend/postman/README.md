# Postman

Esta pasta contém uma collection e um environment local para facilitar a avaliação manual da API.

## Arquivos

- `desafio-backend.postman_collection.json`: collection com fluxos principais da API.
- `desafio-backend.local.postman_environment.json`: variáveis para rodar localmente em `http://localhost:8080`.
- `assets/activity-seed.png`: imagem de exemplo usada no cadastro de atividades.

## Como usar

1. Suba a aplicação e suas dependências.
2. Importe no Postman:
    - `desafio-backend.postman_collection.json`
    - `desafio-backend.local.postman_environment.json`
3. Selecione o environment `Desafio Backend - Local`.
4. Confira a variável `baseUrl`. O valor padrão é:

```text
http://localhost:8080
```

5. Confira a variável `activityImagePath`.

O valor deve apontar para a imagem local `postman/assets/activity-seed.png`. Caso o Postman não resolva o caminho relativo, selecione manualmente esse arquivo no request `Criar atividade privada`, campo `image`.

## Ordem recomendada

Execute as pastas nesta ordem:

1. `01 - Seed usuários e login`
2. `02 - Preferências e tipos`
3. `03 - Atividade privada completa`
4. `04 - Consultas principais`

## Observações

- Execute a collection apenas depois que a API estiver rodando em `http://localhost:8080`.
- Os usuários de teste são criados pela própria collection; eles não são inseridos por seed no banco.
- Os requests de cadastro podem retornar `409 Conflict` se os usuários já existirem. Nesse caso, continue o fluxo a partir dos logins.
- Os logins salvam automaticamente os tokens no environment.
- A criação de atividade salva automaticamente `activityId` e `confirmationCode`.
- A listagem de participantes salva automaticamente `participantRegistrationId`, usado na aprovação.
- Para repetir o fluxo do zero, limpe os volumes com `docker compose down -v` e suba novamente com `docker compose up --build`.