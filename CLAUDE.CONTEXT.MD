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

## 2. Visão de produto (especificada pelo usuário em 2026-08-10)

Esta é a especificação funcional do app, descrita diretamente pelo dono do projeto. Ainda não implementada — ver [seção 5](#5-o-que-está-faltando-gaps-críticos) para o gap em relação ao que existe hoje.

### 2.1 Telas pós-login
Depois da tela de login, o app deve ter:
- **Dashboard**
- **Cadastro de contas**
- **Cadastro de receitas**
- **Cadastro de usuário**
- **Cadastro de categoria** (tela simples: nome + cor)

> ⚠️ **Ponto a esclarecer antes de implementar**: o termo "contas" aqui parece se referir a contas/boletos do mês (contas a pagar — com vencimento, recorrência, status pago/não pago), o que bate com as colunas já existentes na tabela `transacoes` (`data_vencimento`, `data_pagamento`, `is_paid`, `recorrencia`). Isso é diferente da tabela `contas` já criada no Supabase, que tem cara de conta bancária/carteira (`saldo_inicial`, `cor`, `tipo`). Precisa confirmar com o usuário se "Cadastro de contas" = lançar despesas/boletos em `transacoes`, ou se é outra coisa, antes de construir a tela.

### 2.2 Multi-usuário por família (conta compartilhada)
O app é pensado para uso familiar, com mais de um usuário compartilhando os mesmos dados:
- Um usuário "principal" (dono da conta) pode cadastrar outras pessoas da família, definindo email e senha para elas — **segurança fraca aceita de propósito por enquanto** (sem convite/self-signup para os membros da família; o dono cria a credencial diretamente). Revisitar isso depois.
- Cada pessoa, logada com seu próprio usuário, cadastra suas próprias contas/receitas.
- Ao cadastrar um item, deve existir um campo para selecionar **qual usuário da família** é o responsável/autor daquele lançamento (não necessariamente o usuário logado no momento — ex: o dono pode lançar algo em nome de outro membro).
- Todos os membros da família devem ver os gastos uns dos outros (visibilidade compartilhada, não isolada por usuário).

**Implicação de modelo de dados**: o Supabase Auth por si só não tem o conceito de "família"/grupo. Hoje `contas` e `transacoes` só têm `user_id` (dono único). Para suportar esse requisito, provavelmente será necessário:
- Um conceito de "família" (tabela `familias` ou similar) agrupando vários `auth.users`.
- `contas`/`transacoes`/`categorias` passando a pertencer a uma `familia_id` (dado compartilhado), mantendo `user_id` como "cadastrado por" (autor).
- Um endpoint administrativo para o dono da família criar novos usuários (via Supabase Admin API — `supabaseAdmin.auth.admin.createUser()`), já que hoje só existe cadastro público (`/api/auth/cadastro`).

### 2.3 Dashboard
- Informações separadas por **categoria** e por **mês**.
- Deve ser possível também separar/filtrar por **ano**.

### 2.4 Categorias
- Tela de cadastro simples: **nome** + **cor**.
- Cada item lançado (transação) pode receber uma categoria, para saber a finalidade do gasto/receita.
- **Implicação de modelo de dados**: não existe hoje tabela `categorias` no Supabase, nem coluna `categoria_id` em `transacoes` — precisa ser criada.

## 3. Divergência entre o README e a implementação real

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

## 4. O que já está implementado

### Front-end (`controlefinanceiro/`)
- `/` → redireciona para `/login`
- `/login` — formulário funcional, consome `POST /api/auth/login`, salva `token`/`user` no `localStorage` e navega para `/dashboard`
- `/cadastro` — formulário funcional, consome `POST /api/auth/cadastro`
- Layout global simples (Geist font, Tailwind, dark mode via classes)
- Nenhuma das telas da [visão de produto](#2-visão-de-produto-especificada-pelo-usuário-em-2026-08-10) (dashboard, cadastro de contas/receitas/usuário/categoria) existe ainda.

### Back-end (`controlefinanceiro_backend/`)
- `POST /api/auth/cadastro` — cria usuário via Supabase Auth
- `POST /api/auth/login` — autentica via Supabase Auth
- `POST /api/auth/logout`
- `GET /api/auth/me` — protegido por `authMiddleware` (valida Bearer token)
- `GET /api/contas` `POST /api/contas` `PUT /api/contas/:id` `DELETE /api/contas/:id` — CRUD isolado por `user_id` (ver [contas.ts](controlefinanceiro_backend/src/routes/contas.ts))
- `GET /api/transacoes` `POST /api/transacoes` `PUT /api/transacoes/:id` `DELETE /api/transacoes/:id` — CRUD isolado por `user_id` (ver [transacoes.ts](controlefinanceiro_backend/src/routes/transacoes.ts))
- `GET /api/health`
- CORS configurável via `FRONTEND_URL` (env var, aceita múltiplas origens separadas por vírgula)
- `supabaseAdmin` (service role key) reativado em [utils/supabase.ts](controlefinanceiro_backend/src/utils/supabase.ts) — usado pelas rotas de contas/transações, que fazem o filtro de `user_id` manualmente na aplicação (não depende de RLS estar configurado nas tabelas).

> ⚠️ Essas rotas de `contas`/`transacoes` foram feitas para o modelo **antigo** (um usuário = um dono). Elas vão precisar de retrabalho quando o modelo multi-usuário/família da [seção 2.2](#22-multi-usuário-por-família-conta-compartilhada) for implementado (trocar filtro por `user_id` para `familia_id`, adicionar campo de autor).

### Banco de dados (Supabase)
Tabelas existentes hoje (criadas manualmente pelo usuário, sem migration versionada no repo):
- `contas`: `id`, `user_id` (FK `auth.users.id`), `nome`, `tipo`, `saldo_inicial`, `cor`, `created_at`, `updated_at`
- `transacoes`: `id`, `user_id` (FK `auth.users.id`), `descricao`, `valor`, `tipo`, `recorrencia`, `is_paid`, `data_vencimento`, `data_pagamento`, `created_at`, `updated_at`

Faltam (ver [seção 2](#2-visão-de-produto-especificada-pelo-usuário-em-2026-08-10)): tabela de `categorias`, coluna `categoria_id` em `transacoes`, e o conceito de família/grupo multiusuário.

## 5. O que está faltando (gaps críticos)

### 5.1 Funcionalidade principal do app — ausente
Ver a especificação completa na [seção 2](#2-visão-de-produto-especificada-pelo-usuário-em-2026-08-10). Resumo do que falta:
- Não há rota `/dashboard` no front-end, embora **login e cadastro redirecionem para ela** — hoje, um login bem-sucedido leva a um 404.
- Não há nenhuma tela do front-end (dashboard, cadastro de contas, receitas, usuário, categoria) — só existem as rotas de backend de `contas`/`transacoes`, sem UI nenhuma consumindo elas ainda.
- Não existe o modelo de dados de família/multiusuário compartilhado (hoje é um dono por registro).
- Não existe tabela/CRUD de categorias.
- Não existe agrupamento/relatório por categoria, mês ou ano (o "Dashboard").

### 5.2 Autenticação e segurança
- Sem `middleware.ts` no Next.js: as rotas do front-end não são protegidas — qualquer rota futura (`/dashboard`, etc.) pode ser acessada sem sessão válida.
- Token é gerenciado manualmente via `localStorage` em cada página, sem um `AuthContext`/hook central, sem refresh de token e sem interceptor de expiração.
- Botão "Lembrar de mim" no login não tem nenhuma lógica associada.
- Link "Esqueceu a senha?" aponta para `#` — fluxo de recuperação de senha não existe (nem no front nem no back).
- Sem rate limiting / helmet / proteção básica de API no Express.
- Cadastro de usuários da família com "segurança fraca" é uma decisão consciente do usuário por enquanto (ver [seção 2.2](#22-multi-usuário-por-família-conta-compartilhada)) — não tratar como bug, mas revisitar no futuro.

### 5.3 Configuração e DX
- README do front-end ainda é o template padrão do `create-next-app` — não foi personalizado.
- Não há README no backend explicando como rodar/configurar o projeto.
- Não há arquivo `LICENSE`, apesar de referenciado no README.

### 5.4 Qualidade e operação
- Nenhum teste automatizado (unitário, integração ou e2e) em nenhum dos dois projetos.
- Nenhum pipeline de CI/CD (não há `.github/workflows`) — lint/build/test não rodam automaticamente em PRs.
- Sem tratamento de erro estruturado no backend (sem error handler central do Express).
- Sem logging estruturado (apenas `console.log`).
- **Backend ainda não deployado em produção** (decisão: Railway, ver [seção 0](#0-decisões-de-infraestrutura-deploy)) — até isso ser concluído, login/cadastro não funcionam em produção.

## 6. Próximos passos sugeridos (ordem de prioridade)

1. **Deployar o backend no Railway** e conectar a integração Railway↔Vercel para sincronizar `NEXT_PUBLIC_API_URL` (em andamento — ver [seção 0](#0-decisões-de-infraestrutura-deploy)).
2. Esclarecer com o usuário o significado exato de "Cadastro de contas" (ver alerta na [seção 2.1](#21-telas-pós-login)) antes de construir a tela.
3. Desenhar o modelo de dados de família/multiusuário (tabela `familias`, relação com `auth.users`, e como `contas`/`transacoes`/`categorias` referenciam `familia_id` + autor) — decisão estrutural que afeta todo o resto.
4. Criar tabela `categorias` (nome, cor) + coluna `categoria_id` em `transacoes`, com endpoints CRUD.
5. Construir as telas do front-end: Dashboard, Cadastro de contas, Cadastro de receitas, Cadastro de usuário (da família), Cadastro de categoria.
6. Implementar endpoint administrativo para o dono da família criar novos usuários (Supabase Admin API).
7. Implementar o dashboard com agrupamento por categoria/mês e filtro por ano.
8. Proteger rotas autenticadas no front-end (`middleware.ts` ou `AuthContext`).
9. Implementar o fluxo de "esqueci minha senha" via Supabase Auth.
10. Adicionar testes básicos e um workflow de CI (lint + build) no GitHub Actions.
11. Atualizar o README raiz para refletir a stack real (Node/Express/Supabase/Next.js) e adicionar o arquivo LICENSE.
12. Adicionar README próprio no backend explicando setup local e deploy.
