# Murilo Toniol Besson - Desafio Técnico

Este repositório contém a implementação do desafio técnico do bootcamp.

## Backend

A documentação completa da API está disponível em:

```text
backend/README.md
```

O backend inclui autenticação JWT, gerenciamento de usuários, preferências, atividades, inscrições, check-in, XP, níveis, conquistas, upload de imagens com LocalStack/S3, testes automatizados, relatório JaCoCo, Swagger e collection do Postman.

Para executar:

```bash
cd backend
cp .env.example .env
docker compose up --build
```

No Windows PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
docker compose up --build
```

Swagger:

```text
http://localhost:8080/swagger-ui/index.html
```