# Contexto do Projeto — Controle Financeiro

> Gerado a partir de uma análise do código-fonte comparado ao [README.md](README.md) principal. Última atualização: 2026-08-10.

## 0. Decisões de infraestrutura (deploy)

- **Front-end**: Vercel (já configurado, `vercel.json` em `controlefinanceiro/`).
- **Back-end**: **Railway** (decisão tomada em 2026-08-10; ainda não deployado — ver pendências).
  - CORS do Express passou a ler a origem permitida da env var `FRONTEND_URL` (antes era `http://localhost:3000` fixo) — ver [server.ts](controlefinanceiro_backend/src/server.ts).
  - No Railway, criar uma variável `NEXT_PUBLIC_API_URL` = `https://${{RAILWAY_PUBLIC_DOMAIN}}` (usa a referência interna do domínio público gerado pelo Railway).
  - Na Vercel, instalar a **integração Railway** (Settings → Integrations) e sincronizar essa variável para o ambiente de produção do front — evita copiar/colar a URL manualmente e mantém tudo em sincronia se o domínio mudar.
  - Foram criados `.env.example` em [controlefinanceiro_backend/](controlefinanceiro_backend/.env.example) e [controlefinanceiro/](controlefinanceiro/.env.example) documentando as variáveis necessárias em cada lado.

## 1. Visão geral do repositório

Monorepo com duas pastas independentes:

- **[controlefinanceiro/](controlefinanceiro/)** — Front-end (Next.js 16 + React 19 + TypeScript + Tailwind CSS 4). Hospedado na Vercel.
- **[controlefinanceiro_backend/](controlefinanceiro_backend/)** — Back-end (Node.js + Express 5 + TypeScript, usando `tsx`), integrado ao **Supabase** (Auth + Postgres).

## 2. Divergência entre o README e a implementação real

O README raiz descreve um planejamento inicial que **não reflete mais** as decisões técnicas tomadas no código:

| Item do README         | Descrito no README        | Implementado de fato                                   |
| ----------------------- | -------------------------- | -------------------------------------------------------- |
| Banco de Dados           | Firebase, Power BI          | **Supabase** (Postgres + Auth). Sem qualquer integração com Firebase ou Power BI. |
| Back-End                 | Python                      | **Node.js / Express / TypeScript**                       |
| Front-End                | React JS                    | **Next.js** (App Router) + React 19 + TypeScript + Tailwind |
| Sprint 0 (Figma, banco)  | Planejado                   | Não há referência a Figma nem esquema de banco versionado |
| Sprint 1 (Next.js, hospedagem, backend) | Planejado | Concluído (Next.js iniciado, backend iniciado, deploy na Vercel configurado) |
| Sprint 2 (tela de login) | Planejado                   | Concluído (login + cadastro) |
| Licença MIT              | "Veja o arquivo LICENSE"    | **Arquivo LICENSE não existe** no repositório |

Recomenda-se atualizar o README para refletir a stack real (Supabase/Node/Next.js) ou justificar formalmente a mudança de rumo, já que hoje o documento induz a erro qualquer pessoa nova no projeto.

## 3. O que já está implementado

### Front-end (`controlefinanceiro/`)
- `/` → redireciona para `/login`
- `/login` — formulário funcional, consome `POST /api/auth/login`, salva `token`/`user` no `localStorage` e navega para `/dashboard`
- `/cadastro` — formulário funcional, consome `POST /api/auth/cadastro`
- Layout global simples (Geist font, Tailwind, dark mode via classes)

### Back-end (`controlefinanceiro_backend/`)
- `POST /api/auth/cadastro` — cria usuário via Supabase Auth
- `POST /api/auth/login` — autentica via Supabase Auth
- `POST /api/auth/logout`
- `GET /api/auth/me` — protegido por `authMiddleware` (valida Bearer token)
- `GET /api/health`
- CORS configurável via `FRONTEND_URL` (env var, aceita múltiplas origens separadas por vírgula)

## 4. O que está faltando (gaps críticos)

### 4.1 Funcionalidade principal do app — ausente
O README define o propósito central do app ("Entrada de Informações" — recebimentos e despesas — e "Dashboard das Informações"), mas **nada disso existe ainda**:
- Não há rota `/dashboard` no front-end, embora **login e cadastro redirecionem para ela** — hoje, um login bem-sucedido leva a um 404.
- Não há formulário de lançamento de receitas (pagamentos, diária, serviços).
- Não há formulário de lançamento de despesas.
- Não há endpoints de back-end para transações financeiras (CRUD de receitas/despesas).
- Não há schema/migrations do Supabase para tabelas de dados financeiros — só existe o Auth nativo do Supabase.
- Não há nenhuma tela de visualização/relatório (o "Dashboard" do README).

### 4.2 Autenticação e segurança
- Sem `middleware.ts` no Next.js: as rotas do front-end não são protegidas — qualquer rota futura (`/dashboard`, etc.) pode ser acessada sem sessão válida.
- Token é gerenciado manualmente via `localStorage` em cada página, sem um `AuthContext`/hook central, sem refresh de token e sem interceptor de expiração.
- Botão "Lembrar de mim" no login não tem nenhuma lógica associada.
- Link "Esqueceu a senha?" aponta para `#` — fluxo de recuperação de senha não existe (nem no front nem no back).
- `supabaseAdmin` (service role key) está comentado em [utils/supabase.ts](controlefinanceiro_backend/utils/supabase.ts) — nenhuma operação administrativa está disponível.
- Sem rate limiting / helmet / proteção básica de API no Express.

### 4.3 Configuração e DX
- ~~Nenhum `.env.example`~~ — **resolvido em 2026-08-10**: `.env.example` criado em ambas as pastas (ver [seção 0](#0-decisões-de-infraestrutura-deploy)).
- README do front-end ainda é o template padrão do `create-next-app` — não foi personalizado.
- Não há README no backend explicando como rodar/configurar o projeto.
- Não há arquivo `LICENSE`, apesar de referenciado no README.

### 4.4 Qualidade e operação
- Nenhum teste automatizado (unitário, integração ou e2e) em nenhum dos dois projetos.
- Nenhum pipeline de CI/CD (não há `.github/workflows`) — lint/build/test não rodam automaticamente em PRs.
- Sem tratamento de erro estruturado no backend (sem error handler central do Express).
- Sem logging estruturado (apenas `console.log`).
- **Backend ainda não deployado em produção** (decisão: Railway, ver [seção 0](#0-decisões-de-infraestrutura-deploy)) — até isso ser concluído, login/cadastro não funcionam em produção.

## 5. Próximos passos sugeridos (ordem de prioridade)

1. **Deployar o backend no Railway** e conectar a integração Railway↔Vercel para sincronizar `NEXT_PUBLIC_API_URL` (em andamento — ver [seção 0](#0-decisões-de-infraestrutura-deploy)).
2. Criar a rota `/dashboard` no front-end (mesmo que um placeholder) para eliminar o 404 pós-login.
3. Modelar e criar as tabelas de receitas/despesas no Supabase + endpoints CRUD no backend.
4. Construir os formulários de entrada de receitas e despesas descritos no README.
5. Proteger rotas autenticadas no front-end (`middleware.ts` ou `AuthContext`).
6. Implementar o fluxo de "esqueci minha senha" via Supabase Auth.
7. Adicionar testes básicos e um workflow de CI (lint + build) no GitHub Actions.
8. Atualizar o README raiz para refletir a stack real (Node/Express/Supabase/Next.js) e adicionar o arquivo LICENSE.
9. Adicionar README próprio no backend explicando setup local e deploy.
