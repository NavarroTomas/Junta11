-- Existing leagues keep their visibility. Apply atomically with the compatible web client.
alter table public.leagues alter column is_public set default false;

create function public.set_league_visibility(p_league_id uuid, p_public boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_public is null then raise exception 'Seleccioná la visibilidad.'; end if;
  if not exists (select 1 from public.league_members where league_id=p_league_id
    and user_id=auth.uid() and role='owner') then
    raise exception 'Solo el propietario puede cambiar la visibilidad.' using errcode='42501';
  end if;
  update public.leagues set is_public=p_public where id=p_league_id;
end $$;

create function public.remove_league_admin(p_league_id uuid, p_email text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.league_members where league_id=p_league_id
    and user_id=auth.uid() and role='owner') then
    raise exception 'Solo el propietario puede quitar administradores.' using errcode='42501';
  end if;
  delete from public.league_members m using auth.users u
    where m.league_id=p_league_id and m.role='admin' and u.id=m.user_id
      and lower(u.email)=lower(trim(p_email));
  if not found then raise exception 'No hay un administrador con ese correo en esta liga.'; end if;
end $$;
revoke all on function public.set_league_visibility(uuid,boolean), public.remove_league_admin(uuid,text) from public,anon;
grant execute on function public.set_league_visibility(uuid,boolean), public.remove_league_admin(uuid,text) to authenticated;

-- Keep files in place. Convert just the old canonical URLs referring to the row's own league.
-- Abort on unexpected bucket links rather than making unrecognised images disappear.
do $$
declare rec record; prefix text; invalid boolean;
begin
  for rec in select * from (values
    ('leagues','logo_url','id'),('teams','logo_url','league_id'),
    ('players','photo_url','league_id'),('news','image_url','league_id')
  ) as t(tbl,col,lid) loop
    prefix := '^https://[a-z0-9]+[.]supabase[.]co/storage/v1/object/public/league-images/';
    execute format('update public.%1$I set %2$I = replace(%2$I,$2,$3)
      where %2$I ~ ($1 || %3$I::text || ''/[0-9a-f-]{36}[.](jpg|png|webp)$'')',
      rec.tbl,rec.col,rec.lid) using prefix,'/storage/v1/object/public/league-images/','/storage/v1/object/authenticated/league-images/';
    execute format('select exists(select 1 from public.%I where %I like $1)',rec.tbl,rec.col)
      into invalid using '%/storage/v1/object/public/league-images/%';
    if invalid then raise exception 'Revisar referencias antiguas de % antes de migrar.',rec.tbl; end if;
  end loop;
end $$;

update storage.buckets set public=false where id='league-images';

-- Invoker privileges and each table's RLS also apply. A reference in another league
-- cannot authorize the object. Unreferenced uploads are never publicly readable.
create policy "Read published league images" on storage.objects for select to anon,authenticated
using (bucket_id='league-images' and storage.allow_only_operation('storage.object.get_authenticated') and exists (
  select 1 from public.leagues l
  where l.is_public and l.id::text=split_part(storage.objects.name,'/',1)
    and (split_part(l.logo_url,'/storage/v1/object/authenticated/league-images/',2)=storage.objects.name
      or exists(select 1 from public.teams t where t.league_id=l.id and split_part(t.logo_url,'/storage/v1/object/authenticated/league-images/',2)=storage.objects.name)
      or exists(select 1 from public.players p where p.league_id=l.id and split_part(p.photo_url,'/storage/v1/object/authenticated/league-images/',2)=storage.objects.name)
      or exists(select 1 from public.news n where n.league_id=l.id and n.published and split_part(n.image_url,'/storage/v1/object/authenticated/league-images/',2)=storage.objects.name))
));

-- Direct reads re-check membership and visibility. Prevent existing admin SELECT
-- policies from authorizing new bearer links that could outlive revocation.
create policy "Prevent signing league image links" on storage.objects
as restrictive for select to anon,authenticated using (
  bucket_id <> 'league-images' or not (
    storage.allow_only_operation('storage.object.sign') or
    storage.allow_only_operation('storage.object.sign_many') or
    storage.allow_only_operation('storage.render.image_sign')
  )
);
