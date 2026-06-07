-- Agent Skills Hub - PostgreSQL/Supabase schema
-- MVP multi-tenant com isolamento por organization_id, soft delete, RLS e versionamento básico.

create extension if not exists "pgcrypto";

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'mvp',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null,
  display_name text,
  email text not null,
  role text not null check (role in ('Owner', 'Admin', 'Editor', 'Viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  client_context text,
  status text not null default 'rascunho',
  version text not null default '1.0.0',
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table collections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  status text not null default 'rascunho',
  version text not null default '1.0.0',
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table skills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  name text not null,
  slug text not null,
  short_description text,
  full_description text,
  category_id uuid references categories(id) on delete set null,
  content_markdown text,
  input_schema jsonb,
  output_schema jsonb,
  usage_examples text,
  compatibility text[] not null default '{}',
  status text not null default 'rascunho',
  version text not null default '1.0.0',
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table agents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  name text not null,
  slug text not null,
  role text,
  description text,
  objective text,
  system_prompt text,
  operational_instructions text,
  model_recommendation text,
  temperature numeric(3,2),
  autonomy_level text,
  constraints text,
  checklist text,
  status text not null default 'rascunho',
  version text not null default '1.0.0',
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table mcps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  transport_type text not null default 'stdio',
  command text,
  args jsonb not null default '[]',
  env_vars jsonb not null default '{}',
  exposed_tools jsonb not null default '[]',
  config_json jsonb,
  documentation text,
  security_level text not null default 'baixo' check (security_level in ('baixo', 'médio', 'alto')),
  security_notes text,
  status text not null default 'rascunho',
  version text not null default '1.0.0',
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table uploaded_files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  uploaded_by uuid,
  file_name text not null,
  original_file_name text not null,
  file_type text,
  mime_type text,
  file_size bigint not null default 0,
  storage_path text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  classification text,
  status text not null default 'ativo',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table file_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  file_id uuid not null references uploaded_files(id) on delete cascade,
  linked_item_type text not null check (linked_item_type in ('skill', 'agent', 'mcp', 'project', 'collection', 'template', 'documentation')),
  linked_item_id uuid not null,
  file_role text not null default 'Referência',
  description text,
  sort_order int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table agent_skills (
  organization_id uuid not null references organizations(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, agent_id, skill_id)
);

create table agent_mcps (
  organization_id uuid not null references organizations(id) on delete cascade,
  agent_id uuid not null references agents(id) on delete cascade,
  mcp_id uuid not null references mcps(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, agent_id, mcp_id)
);

create table skill_mcps (
  organization_id uuid not null references organizations(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  mcp_id uuid not null references mcps(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, skill_id, mcp_id)
);

create table collection_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  collection_id uuid not null references collections(id) on delete cascade,
  item_type text not null check (item_type in ('skill', 'agent', 'mcp', 'upload', 'template', 'project')),
  item_id uuid not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  template_type text not null,
  content_markdown text,
  status text not null default 'ativo',
  version text not null default '1.0.0',
  created_by uuid,
  updated_by uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table item_tags (
  organization_id uuid not null references organizations(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  item_type text not null,
  item_id uuid not null,
  primary key (organization_id, tag_id, item_type, item_id)
);

create table item_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  item_type text not null,
  item_id uuid not null,
  version text not null,
  changed_by uuid,
  changes text,
  content_previous jsonb,
  content_new jsonb,
  version_note text,
  created_at timestamptz not null default now()
);

create table file_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  file_id uuid not null references uploaded_files(id) on delete cascade,
  version text not null,
  storage_path text not null,
  file_size bigint not null default 0,
  changed_by uuid,
  version_note text,
  created_at timestamptz not null default now()
);

create table import_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  imported_by uuid,
  source_format text,
  summary jsonb,
  created_at timestamptz not null default now()
);

create table export_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  exported_by uuid,
  export_format text,
  summary jsonb,
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_skills_org_status on skills(organization_id, status) where deleted_at is null;
create index idx_agents_org_status on agents(organization_id, status) where deleted_at is null;
create index idx_mcps_org_status on mcps(organization_id, status) where deleted_at is null;
create index idx_uploads_org_status on uploaded_files(organization_id, status) where deleted_at is null;
create index idx_file_links_target on file_links(organization_id, linked_item_type, linked_item_id);

alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table projects enable row level security;
alter table collections enable row level security;
alter table skills enable row level security;
alter table agents enable row level security;
alter table mcps enable row level security;
alter table uploaded_files enable row level security;
alter table file_links enable row level security;
alter table agent_skills enable row level security;
alter table agent_mcps enable row level security;
alter table skill_mcps enable row level security;
alter table collection_items enable row level security;
alter table templates enable row level security;
alter table item_tags enable row level security;
alter table item_versions enable row level security;
alter table file_versions enable row level security;
alter table import_logs enable row level security;
alter table export_logs enable row level security;
alter table audit_logs enable row level security;

create or replace function current_organization_ids()
returns setof uuid
language sql
stable
as $$
  select organization_id
  from organization_members
  where user_id = auth.uid()
$$;

-- Aplique este padrão de policy para todas as tabelas com organization_id em Supabase.
-- Exemplo:
create policy "members can read skills"
on skills for select
using (organization_id in (select current_organization_ids()));

create policy "editors can write skills"
on skills for all
using (
  exists (
    select 1 from organization_members m
    where m.organization_id = skills.organization_id
      and m.user_id = auth.uid()
      and m.role in ('Owner', 'Admin', 'Editor')
  )
)
with check (
  exists (
    select 1 from organization_members m
    where m.organization_id = skills.organization_id
      and m.user_id = auth.uid()
      and m.role in ('Owner', 'Admin', 'Editor')
  )
);
