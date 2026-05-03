-- Adiciona coluna audio_url para podcasts
alter table public.posts add column if not exists audio_url text;
alter table public.posts add column if not exists imagens text[];

-- Permite selecionar posts com áudio para todos (anon)
create policy "Posts com audio visíveis para todos" on public.posts
  for select using (publicado = true or public.has_role(auth.uid(), 'admin'));