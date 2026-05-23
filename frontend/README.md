# Fitmeet Frontend - SysMap Bootcamp

Aplicacao web desenvolvida para o desafio tecnico do bootcamp, com foco em experiencia responsiva, autenticacao, preferencias, descoberta de atividades, criacao e edicao de eventos, inscricoes, aprovacao de participantes, check-in, perfil, XP e conquistas.

O frontend foi construido para consumir a API do projeto `backend/`, respeitando os fluxos definidos no desafio e mantendo a interface proxima ao layout de referencia.

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

- Cadastro e login de usuarios.
- Persistencia de sessao com JWT.
- Protecao de rotas autenticadas.
- Definicao e persistencia de preferencias por tipo de atividade.
- Home com recomendacoes, tipos de atividade e listagens por categoria.
- Listagem defensiva de atividades, evitando exibir atividades canceladas ou encerradas.
- Criacao de atividade publica ou privada.
- Edicao de atividade com modal responsivo.
- Upload e preview de imagem da atividade.
- Selecao de ponto de encontro pelo mapa.
- Detalhes da atividade em modal sobre a home.
- Inscricao e cancelamento de inscricao em atividades.
- Fluxo de aprovacao e rejeicao de participantes para atividades privadas.
- Check-in com codigo de confirmacao.
- Encerramento de atividade pelo organizador.
- Perfil do usuario com historico, XP, nivel e conquistas.
- Edicao de perfil, avatar e desativacao de conta.
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

## Pre-requisitos

- Node.js 22 LTS
- npm
- Backend do Fitmeet em execucao

O projeto possui o arquivo `.nvmrc` com a versao recomendada:

```text
22
```

Caso utilize `nvm`, execute:

```bash
nvm use
```

## Configuracao

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Variavel principal:

```env
VITE_API_URL=http://localhost:8080
```

Em producao, altere para a URL publica da API:

```env
VITE_API_URL=https://sua-api.com
```

Observacoes importantes:

- Apenas variaveis prefixadas com `VITE_` ficam disponiveis no browser.
- Nunca armazene segredos, tokens privados ou credenciais sensiveis no frontend.
- Arquivos `.env.local` e `.env.production` reais nao devem ser versionados.
- O arquivo `.env.example` deve permanecer versionado para documentar a configuracao necessaria.

## Executando Localmente

Na pasta `frontend`, instale as dependencias:

```bash
npm ci
```

Execute a aplicacao em modo desenvolvimento:

```bash
npm run dev
```

A aplicacao ficara disponivel em:

```text
http://localhost:5173
```

## Integracao Com o Backend

O frontend consome a API configurada em `VITE_API_URL`.

Em desenvolvimento, caso `VITE_API_URL` nao esteja definida, o client usa o fallback `/api`, que e redirecionado pelo proxy do Vite para:

```text
http://localhost:8080
```

O backend deve estar rodando e com CORS configurado para aceitar a origem do frontend.

Fluxo recomendado para desenvolvimento local:

1. Subir o backend.
2. Configurar `frontend/.env.local`.
3. Rodar `npm run dev`.
4. Acessar `http://localhost:5173`.

## Scripts Disponiveis

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia o servidor local do Vite |
| `npm run build` | Executa typecheck e gera build de producao |
| `npm run preview` | Serve localmente o build gerado |
| `npm run lint` | Executa a analise estatica com ESLint |
| `npm run test` | Executa os testes em modo watch |
| `npm run test:run` | Executa a suite de testes uma vez |

## Validacao

Antes de entregar ou abrir pull request, execute:

```bash
npm run lint
npm run test:run
npm run build
```

O build final e gerado em:

```text
dist/
```

## Testes

O projeto possui testes automatizados para pontos criticos do frontend:

- validadores de formulario;
- filtros defensivos de atividades;
- renderizacao e validacao basica de login e cadastro.

Para executar a suite:

```bash
npm run test:run
```

## Deploy

### Vercel

Configuracao recomendada:

| Campo | Valor |
| --- | --- |
| Root Directory | `frontend` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `22` |

Variavel de ambiente no painel da Vercel:

```env
VITE_API_URL=https://sua-api.com
```

O arquivo `vercel.json` ja esta configurado para fallback de SPA:

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

Esse fallback permite atualizar a pagina diretamente em rotas internas, como:

```text
/home
/perfil
/atividades/novo
```

### Netlify

Configuracao recomendada:

| Campo | Valor |
| --- | --- |
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | `22` |

Variavel de ambiente no painel da Netlify:

```env
VITE_API_URL=https://sua-api.com
```

O arquivo `public/_redirects` ja esta configurado para fallback de SPA:

```text
/* /index.html 200
```

## Checklist Manual Para Avaliacao

Depois de subir frontend e backend, valide os fluxos principais no navegador:

1. Criar uma conta.
2. Fazer login.
3. Selecionar preferencias.
4. Visualizar recomendacoes na home.
5. Criar atividade publica.
6. Criar atividade privada.
7. Editar atividade.
8. Cancelar atividade.
9. Participar de uma atividade com outro usuario.
10. Cancelar inscricao.
11. Solicitar participacao em atividade privada.
12. Aprovar participante como organizador.
13. Rejeitar participante como organizador.
14. Fazer check-in como participante aprovado.
15. Encerrar atividade como organizador.
16. Editar perfil e avatar.
17. Validar XP e conquistas no perfil.
18. Desativar conta.
19. Testar responsividade em mobile.
20. Atualizar paginas em rotas internas para validar o fallback de SPA.

## Boas Praticas Aplicadas

- Separacao por dominio em `features/`.
- Camada de API centralizada em `src/api`.
- Tipos compartilhados em `src/types`.
- Componentes reutilizaveis em `src/components/ui`.
- Utilitarios isolados em `src/utils`.
- Rotas protegidas para paginas autenticadas.
- Code splitting por rota.
- Tratamento centralizado de erros de API.
- Error boundary global.
- Skeletons em carregamentos relevantes.
- Variaveis de ambiente documentadas.
- Assets locais para imagens padrao e elementos visuais principais.
- Filtros defensivos no frontend para evitar exibicao de atividades canceladas ou encerradas em listagens.

## Observacoes Para Avaliacao

- O frontend foi construido sem TanStack Query ou React Query.
- A autenticacao depende do token JWT retornado pelo backend.
- Criacao e edicao de atividades usam `multipart/form-data`.
- O ponto de encontro e escolhido pelo mapa, mas o payload mantem os campos de endereco esperados pelo backend.
- Atividades privadas exigem aprovacao antes do check-in.
- O codigo de check-in e exibido ao organizador e ao participante que ja realizou o check-in, conforme suporte da API.
- A listagem de participantes para usuario comum depende da permissao retornada pelo backend; quando a API nao permite a consulta completa, a interface mantem fallback visual com o organizador.

## Melhorias Futuras

- Otimizar imagens grandes em `src/assets`, especialmente o hero, usando WebP ou AVIF.
- Ampliar testes de fluxo com Playwright.
- Adicionar testes para modais de atividade e perfil.
- Evoluir skeletons para estados especificos por componente.
- Revisar acessibilidade com navegacao por teclado e leitores de tela.