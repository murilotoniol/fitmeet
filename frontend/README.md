# Fitmeet Frontend - SysMap Bootcamp

Aplicação web desenvolvida para o desafio técnico do bootcamp, com foco em experiência responsiva, autenticação, preferências, descoberta de atividades, criação e edição de eventos, inscrições, aprovação de participantes, check-in, perfil, XP e conquistas.

O frontend foi construído para consumir a API do projeto `backend/`, respeitando os fluxos definidos no desafio e mantendo a interface próxima ao layout de referência.

## Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Componentes no estilo Shadcn/UI
- Base UI
- React Router
- Leaflet e React Leaflet
- Lucide React
- Vitest
- Testing Library
- ESLint

## Funcionalidades

- Cadastro e login de usuários.
- Persistência de sessão com JWT.
- Proteção de rotas autenticadas.
- Definição e persistência de preferências por tipo de atividade.
- Home com recomendações, tipos de atividade e listagens por categoria.
- Listagem defensiva de atividades, evitando exibir atividades canceladas ou encerradas.
- Criação de atividade pública ou privada.
- Edição de atividade com modal responsivo.
- Upload e preview de imagem da atividade.
- Seleção de ponto de encontro pelo mapa.
- Detalhes da atividade em modal sobre a home.
- Inscrição e cancelamento de inscrição em atividades.
- Fluxo de aprovação e rejeição de participantes para atividades privadas.
- Check-in com código de confirmação.
- Encerramento de atividade pelo organizador.
- Perfil do usuário com histórico, XP, nível e conquistas.
- Edição de perfil, avatar e desativação de conta.
- Error boundary global para falhas inesperadas.
- Skeletons de carregamento em telas principais.
- Code splitting por rota para reduzir o bundle inicial.

## Estrutura Principal

```text
frontend/
|-- public
|-- src
|   |-- api
|   |-- assets
|   |-- components
|   |   `-- ui
|   |-- features
|   |   |-- activities
|   |   |-- auth
|   |   |-- home
|   |   |-- preferences
|   |   `-- profile
|   |-- hooks
|   |-- layouts
|   |-- lib
|   |-- routes
|   |-- styles
|   |-- types
|   `-- utils
|-- test
|-- .env.example
|-- .nvmrc
|-- vercel.json
|-- vite.config.ts
`-- package.json
```

## Pré-requisitos

- Node.js 22 LTS
- npm
- Backend do Fitmeet em execução

O projeto possui o arquivo `.nvmrc` com a versão recomendada:

```text
22
```

Caso utilize `nvm`, execute:

```bash
nvm use
```

## Configuração

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Variável principal:

```env
VITE_API_URL=http://localhost:8080
```

Em produção, altere para a URL pública da API:

```env
VITE_API_URL=https://sua-api.com
```

Observações importantes:

- Apenas variáveis prefixadas com `VITE_` ficam disponíveis no browser.
- Nunca armazene segredos, tokens privados ou credenciais sensíveis no frontend.
- Arquivos `.env.local` e `.env.production` reais não devem ser versionados.
- O arquivo `.env.example` deve permanecer versionado para documentar a configuração necessária.

## Executando Localmente

Na pasta `frontend`, instale as dependências:

```bash
npm ci
```

Execute a aplicação em modo de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:5173
```

## Integração Com o Backend

O frontend consome a API configurada em `VITE_API_URL`.

Em desenvolvimento, caso `VITE_API_URL` não esteja definida, o client usa o fallback `/api`, que é redirecionado pelo proxy do Vite para:

```text
http://localhost:8080
```

O backend deve estar rodando e com CORS configurado para aceitar a origem do frontend.

Fluxo recomendado para desenvolvimento local:

1. Subir o backend.
2. Configurar `frontend/.env.local`.
3. Rodar `npm run dev`.
4. Acessar `http://localhost:5173`.

## Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor local do Vite. |
| `npm run build` | Executa typecheck e gera o build de produção. |
| `npm run preview` | Serve localmente o build gerado. |
| `npm run lint` | Executa a análise estática com ESLint. |
| `npm run test` | Executa os testes em modo watch. |
| `npm run test:run` | Executa a suíte de testes uma vez. |

## Validação

Antes de entregar ou abrir pull request, execute:

```bash
npm run lint
npm run test:run
npm run build
```

O build final é gerado em:

```text
dist/
```

## Testes

O projeto possui testes automatizados para pontos críticos do frontend:

- validadores de formulário;
- filtros defensivos de atividades;
- renderização e validação básica de login e cadastro.

Para executar a suíte:

```bash
npm run test:run
```

## Deploy

### Vercel

Configuração recomendada:

| Campo | Valor |
| --- | --- |
| Root Directory | `frontend` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `22` |

Variável de ambiente no painel da Vercel:

```env
VITE_API_URL=https://sua-api.com
```

O arquivo `vercel.json` já está configurado para fallback de SPA:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Esse fallback permite atualizar a página diretamente em rotas internas, como:

```text
/home
/perfil
/atividades/novo
```

### Netlify

Configuração recomendada:

| Campo | Valor |
| --- | --- |
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `22` |

Variável de ambiente no painel da Netlify:

```env
VITE_API_URL=https://sua-api.com
```

O arquivo `public/_redirects` já está configurado para fallback de SPA:

```text
/* /index.html 200
```
