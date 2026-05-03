-- Cria tabela exclusiva para podcasts
create table if not exists public.podcasts (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  slug text unique not null,
  excerpt text,
  conteudo text,
  capa_url text,
  imagens text[],
  audio_url text not null,
  categoria text default 'podcast',
  autor text,
  publicado boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migra dados existentes de posts com audio_url
insert into public.podcasts (id, titulo, slug, excerpt, conteudo, capa_url, imagens, audio_url, categoria, autor, publicado, published_at, created_at, updated_at)
select id, titulo, slug, excerpt, conteudo, capa_url, imagens, audio_url, categoria, autor, publicado, published_at, created_at, updated_at
from public.posts
where audio_url is not null and audio_url != '';

-- Remove coluna audio_url de posts
alter table public.posts drop column if exists audio_url;

-- Permite selecionar podcasts para todos (anon)
create policy "Podcasts visíveis para todos" on public.podcasts
  for select using (publicado = true or public.has_role(auth.uid(), 'admin'));