-- ============================================================================
-- Engineering Academy — Migration 0001 (schema inicial + RLS)
-- ============================================================================
-- COMO RODAR (você é iniciante, então sem mistério):
--   1. Crie um projeto em https://app.supabase.com
--   2. No projeto: SQL Editor -> New query
--   3. Cole TODO este arquivo e clique em "Run"
--   4. Pegue a URL e as keys em Project Settings -> API e ponha no .env.local
--
-- FILOSOFIA: o banco é a VERDADE ÚNICA (a "pedra"). O conteúdo dos módulos NÃO
-- mora aqui — mora em arquivos (docs/academy/). O banco guarda só o PROGRESSO.
-- O RLS garante que um Builder jamais enxerga os dados de outro.
-- ============================================================================

-- ---- Tipos (enums) -----------------------------------------------------------

-- Estado de um módulo pra um Builder.
do $$ begin
  create type module_status as enum ('locked', 'available', 'in_progress', 'passed');
exception when duplicate_object then null; end $$;

-- Nível de maestria numa capacidade. Sobe por evidência; pode esfriar por leak.
do $$ begin
  create type capability_level as enum (
    'none', 'awareness', 'assisted_execution', 'independent_execution', 'mastery'
  );
exception when duplicate_object then null; end $$;

-- ---- Builder (perfil 1:1 com o usuário do Supabase Auth) ---------------------

create table if not exists public.builders (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text,
  email       text,
  criado_em   timestamptz not null default now()
);

-- ---- ModuleProgress ----------------------------------------------------------
-- Um módulo só fica 'available' quando os prerequisites estão 'passed'.
-- Módulo 01 nasce 'available' (sem prerequisites). Status 'passed' só é setado
-- por uma Evaluation que passou no gate.

create table if not exists public.module_progress (
  id           uuid primary key default gen_random_uuid(),
  builder_id   uuid not null references public.builders (id) on delete cascade,
  module_id    text not null,
  status       module_status not null default 'locked',
  iniciado_em  timestamptz,
  fechado_em   timestamptz,
  unique (builder_id, module_id)
);

-- ---- Capability --------------------------------------------------------------
-- level só sobe por evidência de Evaluation. intensity (0..100) deriva do level.
-- cooled = true quando um leak reincidente rebaixou a capacidade.

create table if not exists public.capabilities (
  id             uuid primary key default gen_random_uuid(),
  builder_id     uuid not null references public.builders (id) on delete cascade,
  capability_id  text not null,
  level          capability_level not null default 'none',
  intensity      int not null default 0 check (intensity between 0 and 100),
  cooled         boolean not null default false,
  atualizado_em  timestamptz not null default now(),
  unique (builder_id, capability_id)
);

-- ---- Submission --------------------------------------------------------------
-- O texto do entregável do Builder. É DADO a ser avaliado, nunca instrução.

create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  builder_id  uuid not null references public.builders (id) on delete cascade,
  module_id   text not null,
  mission_id  text not null,
  conteudo    text not null,
  criado_em   timestamptz not null default now()
);

-- ---- Evaluation --------------------------------------------------------------
-- O JSON estruturado da IA (contrato fixo). gate_passed decide o unlock.
-- Enquanto revisado_por_humano = false num gate, o unlock fica PENDENTE.
-- (builder_id é denormalizado aqui só pra simplificar o RLS — documentado.)

create table if not exists public.evaluations (
  id                  uuid primary key default gen_random_uuid(),
  submission_id       uuid not null references public.submissions (id) on delete cascade,
  builder_id          uuid not null references public.builders (id) on delete cascade,
  rubric_version      text not null,
  resultado_json      jsonb not null,
  gate_passed         boolean not null default false,
  revisado_por_humano boolean not null default false,
  criado_em           timestamptz not null default now()
);

-- ---- LeakLog -----------------------------------------------------------------
-- Registro do TIPO de erro. Se o mesmo leak_tag aparece 2+ vezes em módulos
-- diferentes, a Capability relacionada vira 'cooled' e dispara reforço dirigido.

create table if not exists public.leak_logs (
  id          uuid primary key default gen_random_uuid(),
  builder_id  uuid not null references public.builders (id) on delete cascade,
  leak_tag    text not null,
  module_id   text not null,
  criado_em   timestamptz not null default now()
);

-- ---- PortfolioItem -----------------------------------------------------------
-- O entregável vira prova permanente de capacidade.

create table if not exists public.portfolio_items (
  id          uuid primary key default gen_random_uuid(),
  builder_id  uuid not null references public.builders (id) on delete cascade,
  module_id   text not null,
  titulo      text not null,
  conteudo    text not null,
  criado_em   timestamptz not null default now()
);

-- ---- Índices pra listas que crescem (paginação) ------------------------------
create index if not exists idx_submissions_builder_criado
  on public.submissions (builder_id, criado_em desc);
create index if not exists idx_portfolio_builder_criado
  on public.portfolio_items (builder_id, criado_em desc);
create index if not exists idx_evaluations_builder_criado
  on public.evaluations (builder_id, criado_em desc);
create index if not exists idx_leaklogs_builder
  on public.leak_logs (builder_id, leak_tag);

-- ============================================================================
-- ROW LEVEL SECURITY — cada Builder só toca os próprios dados
-- ============================================================================

alter table public.builders        enable row level security;
alter table public.module_progress enable row level security;
alter table public.capabilities     enable row level security;
alter table public.submissions      enable row level security;
alter table public.evaluations      enable row level security;
alter table public.leak_logs        enable row level security;
alter table public.portfolio_items  enable row level security;

-- builders: o dono é a própria linha (id = auth.uid())
drop policy if exists "builder vê o próprio perfil" on public.builders;
create policy "builder vê o próprio perfil" on public.builders
  for select using (auth.uid() = id);
drop policy if exists "builder edita o próprio perfil" on public.builders;
create policy "builder edita o próprio perfil" on public.builders
  for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "builder deleta o próprio perfil" on public.builders;
create policy "builder deleta o próprio perfil" on public.builders
  for delete using (auth.uid() = id);

-- Helper macro mental: pras tabelas com builder_id, dono = (auth.uid() = builder_id).
-- Aplicado em select/insert/update/delete.

-- module_progress
drop policy if exists "mp dono" on public.module_progress;
create policy "mp dono" on public.module_progress
  for all using (auth.uid() = builder_id) with check (auth.uid() = builder_id);

-- capabilities
drop policy if exists "cap dono" on public.capabilities;
create policy "cap dono" on public.capabilities
  for all using (auth.uid() = builder_id) with check (auth.uid() = builder_id);

-- submissions
drop policy if exists "sub dono" on public.submissions;
create policy "sub dono" on public.submissions
  for all using (auth.uid() = builder_id) with check (auth.uid() = builder_id);

-- evaluations
drop policy if exists "eval dono" on public.evaluations;
create policy "eval dono" on public.evaluations
  for all using (auth.uid() = builder_id) with check (auth.uid() = builder_id);

-- leak_logs
drop policy if exists "leak dono" on public.leak_logs;
create policy "leak dono" on public.leak_logs
  for all using (auth.uid() = builder_id) with check (auth.uid() = builder_id);

-- portfolio_items
drop policy if exists "port dono" on public.portfolio_items;
create policy "port dono" on public.portfolio_items
  for all using (auth.uid() = builder_id) with check (auth.uid() = builder_id);

-- ============================================================================
-- TRIGGER — ao criar usuário no Auth, cria o perfil Builder automaticamente
-- ============================================================================
-- SECURITY DEFINER pra inserir contornando o RLS (é o sistema agindo, não o user).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.builders (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- FIM. RLS ligado, trigger ativo. O app cuida do resto (progresso, avaliação).
-- ============================================================================
