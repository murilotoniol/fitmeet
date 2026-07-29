# Fitmeet - Desafio Técnico SysMap Bootcamp

Repositório com a implementação do Fitmeet, uma plataforma para descoberta, criação e participação em atividades. O projeto é composto por uma API REST em Spring Boot e uma aplicação web em React, integradas por autenticação JWT e fluxos completos de preferências, atividades, participantes, check-in, XP e conquistas.

## Projetos

```text
.
|-- backend
|-- frontend
|-- mobile
|-- LICENSE
`-- README.md
```

Documentações específicas:

- [Backend](backend/README.md)
- [Frontend](frontend/README.md)

O diretório `mobile/` faz parte da estrutura do repositório, mas a entrega principal deste projeto está concentrada em `backend/` e `frontend/`.

## Visão Geral

### Backend

API REST responsável por:

- cadastro e login de usuários;
- autenticação JWT;
- perfil, avatar, preferências e desativação de conta;
- tipos de atividade;
- criação, edição, cancelamento e encerramento de atividades;
- participação em atividades públicas e privadas;
- aprovação e rejeição de participantes;
- check-in com código de confirmação;
- cálculo de XP, nível e conquistas;
- upload e consulta de imagens com armazenamento compatível com S3;
- documentação via Swagger/OpenAPI;
- collection do Postman para validação manual.

Stack principal:

- Java 25
- Spring Boot 4
- Spring Security
- Spring Data JPA
- PostgreSQL
- Liquibase
- LocalStack/S3
- Docker Compose
- JUnit, Mockito e JaCoCo

### Frontend

Aplicação web responsável por:

- login e cadastro;
- proteção de rotas autenticadas;
- seleção de preferências;
- home com recomendações, tipos de atividade e listagens por categoria;
- criação e edição de atividades com upload de imagem;
- seleção de ponto de encontro pelo mapa;
- detalhes da atividade em modal sobre a home;
- participação, aprovação, rejeição, check-in e encerramento;
- perfil com histórico, XP, nível e conquistas;
- edição de perfil, avatar e desativação de conta;
- estados de carregamento, error boundary e code splitting por rota.

Stack principal:

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Componentes no estilo Shadcn/UI
- React Router
- Leaflet
- Vitest e Testing Library

## Pré-requisitos

Para rodar a aplicação completa localmente:

- Docker
- Docker Compose
- Node.js 22 LTS
- npm

Para rodar o backend fora do Docker:

- Java 25
- Maven ou Maven Wrapper
- PostgreSQL
- LocalStack, caso queira testar upload de imagens localmente

## Executando o Backend

Na pasta `backend`, copie o arquivo de ambiente:

```bash
cd backend
cp .env.example .env
```

No Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Suba os serviços:

```bash
docker compose up --build
```

A API ficará disponível em:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/swagger-ui/index.html
```

## Executando o Frontend

Em outro terminal, na pasta `frontend`, copie o arquivo de ambiente:

```bash
cd frontend
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
cd frontend
Copy-Item .env.example .env.local
```

Variável principal:

```env
VITE_API_URL=http://localhost:8080
```

Instale as dependências e inicie o Vite:

```bash
npm ci
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Validação

### Frontend

Na pasta `frontend`:

```bash
npm run lint
npm run test:run
npm run build
```

### Backend

Na pasta `backend`:

```bash
./mvnw test
```

No Windows:

```powershell
.\mvnw.cmd test
```

Quando o Maven Wrapper apresentar falha local no PowerShell, também é possível usar uma instalação Maven local apontando para o mesmo projeto.

## Deploy do Frontend

Deploy recomendado na Vercel:

| Campo | Valor |
| --- | --- |
| Root Directory | `frontend` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `22` |

Variável obrigatória:

```env
VITE_API_URL=https://sua-api.com
```

O arquivo `frontend/vercel.json` já possui fallback para SPA, permitindo refresh direto em rotas internas.
