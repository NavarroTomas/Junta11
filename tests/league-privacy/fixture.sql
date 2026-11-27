-- Synthetic schema for a new disposable test database.
create role anon;
create role authenticated;
create schema auth;
create schema storage;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid
$$;
create table public.leagues (id uuid primary key, is_public boolean not null default true, logo_url text check(logo_url ~ '^https://'));
create table public.league_members (league_id uuid, user_id uuid, role text check(role in ('owner','admin')), primary key(league_id,user_id));
create table public.players (league_id uuid, photo_url text check(photo_url ~ '^https://'));
create table public.teams (league_id uuid, logo_url text check(logo_url ~ '^https://'));
create table public.news (league_id uuid, published boolean, image_url text check(image_url ~ '^https://'));
create table storage.buckets (id text primary key, public boolean not null);
create table storage.objects (bucket_id text, name text);
alter table storage.objects enable row level security;
grant usage on schema auth,storage to anon,authenticated;
grant select on storage.objects,public.leagues,public.teams,public.players,public.news to anon,authenticated;
grant select on public.league_members to authenticated;
alter table public.league_members enable row level security;
create policy own_membership on public.league_members for select to authenticated using(user_id=auth.uid());
create policy manager_images on storage.objects for select to authenticated using(
 bucket_id='league-images' and exists(select 1 from public.league_members m where m.user_id=auth.uid() and m.league_id::text=split_part(name,'/',1))
);
insert into storage.buckets values ('league-images',true);
insert into auth.users values
 ('00000000-0000-4000-a000-000000000011','owner@example.test'),
 ('00000000-0000-4000-a000-000000000012','admin@example.test'),
 ('00000000-0000-4000-a000-000000000013','other@example.test');
insert into public.leagues(id) values ('00000000-0000-4000-a000-000000000001');
insert into public.league_members values
 ('00000000-0000-4000-a000-000000000001','00000000-0000-4000-a000-000000000011','owner'),
 ('00000000-0000-4000-a000-000000000001','00000000-0000-4000-a000-000000000012','admin'),
 ('00000000-0000-4000-a000-000000000002','00000000-0000-4000-a000-000000000013','owner');
insert into storage.objects values
 ('league-images','00000000-0000-4000-a000-000000000001/00000000-0000-4000-a000-000000000021.png'),
 ('league-images','00000000-0000-4000-a000-000000000001/00000000-0000-4000-a000-000000000022.png');
insert into public.teams values ('00000000-0000-4000-a000-000000000001','https://example.supabase.co/storage/v1/object/public/league-images/00000000-0000-4000-a000-000000000001/00000000-0000-4000-a000-000000000021.png');
insert into public.news values ('00000000-0000-4000-a000-000000000001',false,'https://example.supabase.co/storage/v1/object/public/league-images/00000000-0000-4000-a000-000000000001/00000000-0000-4000-a000-000000000022.png');

-- Model the Storage operation set by the HTTP service for a direct download.
create function storage.allow_only_operation(expected text) returns boolean language sql stable as $$
 select current_setting('test.storage_operation',true)=expected
$$;
create table public.matches (league_id uuid, venue text);
insert into public.matches values ('00000000-0000-4000-a000-000000000001','Cancha de prueba');
alter table public.matches enable row level security;
grant select,update(venue) on public.matches to authenticated;
create policy manager_match_edit on public.matches for all to authenticated using(
 exists(select 1 from league_members m where m.user_id=auth.uid() and m.league_id=matches.league_id)
);
