# Engineering Academy — MVP

> Aprenda engenharia **construindo**, não assistindo. Avance só quando **provar por evidência** que desenvolveu uma capacidade. Um AI Guide te provoca, avalia o que você entrega contra uma rubrica fechada, aponta a fraqueza e te dá a próxima ação. Sem badge, sem streak, sem número de vaidade.

Primeiro produto do projeto **Prometheus**. Esta build coloca o **Builder #1** (você) dentro de um módulo completo, ponta a ponta.

---

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack) + **React 19**
- **Tailwind v4** (config CSS-first, tokens no `globals.css`)
- **Supabase** (Postgres + Auth magic link + Row Level Security)
- **Anthropic API** (AI Guide + avaliação por evidência, só no backend)
- Deploy alvo: **Vercel**

---

## Pré-requisitos

- **Node 18+** (você tem o 24, perfeito) e npm
- Uma conta gratuita no **Supabase** → https://app.supabase.com
- Uma chave da **Anthropic** → https://console.anthropic.com

Você **não precisa** instalar Supabase CLI nem nada local de banco. Tudo é pela nuvem.

---

## Setup passo a passo (do zero ao app rodando)

### 1. Instale as dependências

```bash
npm install
```

### 2. Crie o projeto no Supabase e rode o banco

1. Em https://app.supabase.com → **New project** (escolha uma senha forte pro banco, guarde).
2. Espere ~2 min o projeto subir.
3. Vá em **SQL Editor** → **New query**.
4. Abra o arquivo [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) deste projeto, **copie tudo**, cole no editor e clique em **Run**.
   - Isso cria as tabelas, liga o **RLS** (cada Builder só vê os próprios dados) e o trigger que cria seu perfil no primeiro login.

### 3. Pegue as chaves do Supabase

Em **Project Settings → API**:

- `Project URL` → vira `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → vira `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` (clique em "reveal", é secreta) → vira `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure o redirect do magic link (IMPORTANTE)

Em **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: adicione `http://localhost:3000/**`

Sem isso o link mágico do e-mail não consegue voltar pro app.

> Em dev, o Supabase envia os e-mails de magic link com um provedor próprio (limitado). Pra uso real, configure um SMTP em Authentication → Emails.

### 5. Pegue a chave da Anthropic

Em https://console.anthropic.com → **API Keys** → crie uma → vira `ANTHROPIC_API_KEY`.

### 6. Crie o `.env.local`

Copie o template e preencha com o que você pegou acima:

```bash
cp .env.example .env.local
```

Depois edite o `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

O `.env.local` **nunca** vai pro git (já está no `.gitignore`).

### 7. Rode

```bash
npm run dev
```

Abra http://localhost:3000, clique em **Entrar**, ponha seu e-mail, clique no link mágico que chegar, e você cai no **Cockpit** como Builder #1. 🎯

---

## A jornada do Builder (o que você vai viver)

1. **Cockpit** — vê seu próximo passo e entra direto nele.
2. **Missão** — Briefing → constrói o entregável num editor, com o **AI Guide** do lado (ele provoca, nunca entrega a resposta) → submete.
3. **Avaliação** — recebe o nível de maestria por capacidade e o feedback no contrato fixo: o que foi bem, o gap que trava, a próxima micro-missão.
4. **Skill Tree** — o grafo das suas capacidades acende por evidência.
5. **Trilha** — o cronograma dos 4 ciclos e onde você está.
6. **Portfólio** — cada entregável aprovado vira evidência permanente.

O conteúdo do Módulo 01 vive em [`docs/academy/cycle-01/module-01.md`](docs/academy/cycle-01/module-01.md). Pra criar o Módulo 02, é só adicionar outro arquivo seguindo o mesmo formato — o app carrega e valida sozinho.

---

## Estrutura do projeto

```
src/
  app/
    page.tsx                 landing pública
    login/                   magic link (+ estado "config faltando")
    auth/callback/           troca o código do link por sessão
    cockpit/ trilha/         telas autenticadas
    skill-tree/ portfolio/
    missao/[moduleId]/       fluxo da missão
    avaliacao/[submissionId]/ resultado da avaliação
    api/
      ai-guide/              chat de mentoria (backend)
      evaluate/              pipeline de avaliação (backend)
      health/                checks dev-only (loader, dry-run objetivo)
  lib/
    supabase/                clients browser/server/admin + middleware
    modules/                 loader file-driven + schema (zod)
    ai/                      Anthropic, prompts (anti-injeção), contrato,
                             resolvedor objetivo, pipeline de avaliação
    builder/                 estado do Builder, progresso, aplicar avaliação
    domain/                  tipos de domínio (níveis, intensidade)
  components/                UI (AppNav, SkillTree, missão, skeletons...)
supabase/migrations/         o SQL do banco + RLS
docs/academy/                o conteúdo dos módulos (a "verdade" do currículo)
```

### Pedra e vitral (a arquitetura em uma ideia)

- **Pedra** (determinística, tem que estar certa sempre): o banco como verdade única, o RLS, o gate calculado por regra, os itens objetivos do checklist resolvidos por código, o contrato JSON validado.
- **Vitral** (IA, trocável): o AI Guide e o julgamento subjetivo da avaliação. A IA nunca decide sozinha o que pode ser regra — e o conteúdo do Builder é sempre tratado como **dado**, nunca como instrução (anti-injeção).

---

## Deploy na Vercel

1. Suba o repo pro GitHub e importe na Vercel.
2. Em **Settings → Environment Variables**, ponha as mesmas 5 variáveis do `.env.local` (com a URL de produção em `NEXT_PUBLIC_SITE_URL`).
3. No Supabase, adicione a URL de produção nos **Redirect URLs** (ex: `https://seu-app.vercel.app/**`).
4. Deploy.

---

## Scripts

```bash
npm run dev      # desenvolvimento (localhost:3000)
npm run build    # build de produção (faz typecheck)
npm run start    # roda o build
npm run lint     # eslint
```

---

## Notas do MVP (decisões honestas)

- **Revisão humana nos gates**: quando você passa um gate, sua capacidade já fica registrada, mas o **desbloqueio do próximo módulo** espera `revisado_por_humano = true` na avaliação (você confere no Supabase). É a trava de qualidade do MVP.
- **Rate limit** das rotas de IA é **em memória** (best-effort, por instância). Pra produção séria, troque por um store compartilhado (Upstash/Redis).
- **Custo de IA**: itens objetivos resolvidos por regra antes da IA; **Haiku** no rotineiro, **Sonnet** nos gates; prompt caching na rubrica.
- **Fora de escopo** nesta versão: comunidade, B2B, marketplace, múltiplas academias, e os módulos além do 01.
