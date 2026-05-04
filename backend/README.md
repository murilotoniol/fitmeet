# Desafio Backend - SysMap Bootcamp

API REST desenvolvida para o desafio técnico do bootcamp, com autenticação JWT, gerenciamento de usuários, preferências, atividades, inscrições, aprovação de participantes, check-in, pontuação por XP, níveis, conquistas e upload de imagens em armazenamento compatível com S3.

## Tecnologias

- Java 25
- Spring Boot 4
- Spring Web MVC
- Spring Security
- JWT
- Spring Data JPA
- PostgreSQL
- Liquibase
- AWS SDK S3
- LocalStack
- Docker e Docker Compose
- JUnit 6
- Mockito
- JaCoCo
- Springdoc OpenAPI/Swagger

## Funcionalidades

- Cadastro e login de usuários.
- Autenticação com JWT.
- Consulta, atualização e desativação de conta.
- Atualização de avatar via multipart upload.
- Definição e consulta de preferências por tipo de atividade.
- Listagem de tipos de atividades.
- Criação, atualização, conclusão e exclusão lógica de atividades.
- Listagem de atividades com paginação, filtro por tipo e ordenação.
- Priorização de atividades por interesses do usuário quando não há filtro de tipo.
- Inscrição em atividades públicas e privadas.
- Aprovação e rejeição de participantes em atividades privadas.
- Check-in com código de confirmação.
- Cancelamento de inscrição antes do check-in.
- Pontuação por XP, cálculo de nível e concessão de conquistas.
- Upload de imagens para LocalStack/S3.
- Documentação da API via Swagger.
- Collection do Postman para facilitar a avaliação manual.

## Estrutura Principal

```text
backend/
├── src/main/java/com/bootcamp/desafio_backend
│   ├── config
│   ├── controllers
│   ├── dtos
│   ├── enums
│   ├── exceptions
│   ├── models
│   ├── repositories
│   ├── security
│   └── services
├── src/main/resources/db/changelog
├── src/test/java/com/bootcamp/desafio_backend
├── postman
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

## Pré-requisitos

Para rodar com Docker:

- Docker
- Docker Compose

Para rodar localmente sem Docker:

- Java 25
- Maven ou Maven Wrapper
- PostgreSQL
- LocalStack, caso queira testar upload de imagens localmente

## Configuração

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Variáveis principais:

```env
DB_NAME=database_name
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432

AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=sa-east-1
AWS_S3_BUCKET=backend-challenge-images
LOCALSTACK_ENDPOINT=http://localhost:4566
APP_PUBLIC_URL=http://localhost:8080

JWT_SECRET=change-this-secret
JWT_EXPIRATION=86400000

EXPERIENCE_LEVEL_BASE_XP=100
EXPERIENCE_LEVEL_MULTIPLIER=1.08
EXPERIENCE_CHECK_IN_PARTICIPANT_XP=25
EXPERIENCE_CHECK_IN_CREATOR_XP=5
```

Observação: para entrega ou produção, altere `JWT_SECRET` para um valor forte.

## Executando com Docker

Na pasta `backend`, execute:

```bash
docker compose up --build
```

A aplicação ficará disponível em:

```text
http://localhost:8080
```

Serviços do compose:

- `app`: API Spring Boot.
- `db`: PostgreSQL usado pela aplicação.
- `localstack`: serviço local compatível com S3 para upload de imagens.

### Resetando o ambiente Docker

Caso queira limpar o banco, imagens armazenadas e volumes locais para executar o fluxo desde o começo:

```bash
docker compose down -v
docker compose up --build
```

## Executando Localmente

Com PostgreSQL e LocalStack configurados, execute:

```bash
./mvnw spring-boot:run
```

No Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

## Documentação da API

Com a aplicação em execução, acesse:

```text
http://localhost:8080/swagger-ui/index.html
```

OpenAPI JSON:

```text
http://localhost:8080/v3/api-docs
```

## Endpoints Principais

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/auth/register` | Cadastra um usuário |
| `POST` | `/auth/sign-in` | Autentica um usuário |

### Usuários

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/user` | Busca dados do usuário autenticado |
| `PUT` | `/user/update` | Atualiza dados do usuário autenticado |
| `PUT` | `/user/avatar` | Atualiza avatar do usuário |
| `DELETE` | `/user/deactivate` | Desativa a conta do usuário |
| `GET` | `/user/preferences` | Lista preferências do usuário |
| `POST` | `/user/preferences/define` | Define preferências do usuário |

### Atividades

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/activities/types` | Lista tipos de atividades |
| `GET` | `/activities` | Lista atividades com paginação |
| `GET` | `/activities/all` | Lista todas as atividades |
| `POST` | `/activities/new` | Cria uma atividade |
| `PUT` | `/activities/{id}/update` | Atualiza uma atividade |
| `DELETE` | `/activities/{id}/delete` | Exclui logicamente uma atividade |
| `GET` | `/activities/user/creator` | Lista atividades criadas pelo usuário, com paginação |
| `GET` | `/activities/user/creator/all` | Lista todas as atividades criadas pelo usuário |
| `GET` | `/activities/user/participant` | Lista atividades em que o usuário se inscreveu, com paginação |
| `GET` | `/activities/user/participant/all` | Lista todas as atividades em que o usuário se inscreveu |
| `GET` | `/activities/{id}/participants` | Lista participantes de uma atividade |
| `POST` | `/activities/{id}/subscribe` | Inscreve o usuário em uma atividade |
| `PUT` | `/activities/{id}/approve` | Aprova ou rejeita um participante |
| `PUT` | `/activities/{id}/check-in` | Realiza check-in com código de confirmação |
| `PUT` | `/activities/{id}/conclude` | Conclui uma atividade |
| `DELETE` | `/activities/{id}/unsubscribe` | Cancela inscrição em uma atividade |

### Imagens

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/images/{fileName}` | Busca uma imagem armazenada no LocalStack/S3 |

## Regras de XP e Níveis

As regras de experiência são configuráveis via `application.yml` ou `.env`.

Valores padrão:

- XP base para subir do nível 1: `100`
- Multiplicador por nível: `1.08`
- XP do participante ao fazer check-in: `25`
- XP do criador quando há check-in em sua atividade: `5`

O cálculo de nível considera o XP acumulado do usuário. Sempre que o usuário recebe XP, o nível é recalculado e as conquistas por nível são avaliadas.

## Conquistas

O projeto possui concessão automática de conquistas para eventos como:

- primeiro check-in;
- primeiro check-in em atividade de tecnologia;
- primeira atividade criada;
- primeira atividade concluída;
- níveis específicos de experiência.

As conquistas são criadas via seed do Liquibase.

## Respostas de Erro

As exceções da API seguem o formato:

```json
{
  "error": "Mensagem do erro."
}
```

Os status HTTP são definidos de acordo com a regra de negócio correspondente.

## Testes

O projeto possui testes para controllers, services, tratamento global de exceções e segurança/JWT.

Para rodar a suíte de testes:

```bash
./mvnw test
```

No Windows:

```powershell
.\mvnw.cmd test
```

## Cobertura com JaCoCo

Para gerar o relatório de cobertura:

```bash
./mvnw verify
```

No Windows:

```powershell
.\mvnw.cmd verify
```

Relatório HTML:

```text
target/site/jacoco/index.html
```

O relatório exclui classes de DTO, models, enums, configurações e a classe principal da aplicação, focando a análise nas camadas com regra e comportamento.

## Postman

A pasta `postman/` contém:

- collection com os principais fluxos da API;
- environment local;
- imagem de exemplo para criação de atividades.

A collection cria os usuários de teste automaticamente. Por isso, o banco mantém apenas seeds estruturais, como tipos de atividade e conquistas.

Arquivos:

```text
postman/desafio-backend.postman_collection.json
postman/desafio-backend.local.postman_environment.json
postman/assets/activity-seed.png
```

Ordem recomendada para execução:

1. `01 - Seed usuarios e login`
2. `02 - Preferencias e tipos`
3. `03 - Atividade privada completa`
4. `04 - Consultas principais`

Mais detalhes estão em:

```text
postman/README.md
```

## Migrations e Seeds

O banco é versionado com Liquibase.

As migrations ficam em:

```text
src/main/resources/db/changelog/migrations
```

O arquivo principal é:

```text
src/main/resources/db/changelog/db.changelog-master.yml
```

As seeds incluem tipos de atividade e conquistas iniciais.

## Observações Para Avaliação

- O backend utiliza autenticação JWT. Com exceção de cadastro, login, Swagger e OpenAPI, os endpoints exigem token.
- Atividades privadas exigem aprovação do criador antes do check-in.
- O código de confirmação da atividade é retornado para o criador.
- Imagens são enviadas via `multipart/form-data`.
- O upload local usa LocalStack como serviço compatível com S3.
- As URLs de imagens retornadas pela API usam `APP_PUBLIC_URL` e apontam para `/images/{fileName}`.
- A collection do Postman cria usuários de teste e executa um fluxo completo de atividade privada.