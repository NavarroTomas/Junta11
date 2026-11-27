alter policy "Read published league images" on storage.objects using (
  bucket_id = 'league-images' and exists (
    select 1 from public.leagues l
    where l.is_public and l.id::text = split_part(storage.objects.name, '/', 1)
      and (split_part(l.logo_url, '/storage/v1/object/authenticated/league-images/', 2) = storage.objects.name
        or exists (select 1 from public.teams t where t.league_id = l.id and split_part(t.logo_url, '/storage/v1/object/authenticated/league-images/', 2) = storage.objects.name)
        or exists (select 1 from public.players p where p.league_id = l.id and split_part(p.photo_url, '/storage/v1/object/authenticated/league-images/', 2) = storage.objects.name)
        or exists (select 1 from public.news n where n.league_id = l.id and n.published and split_part(n.image_url, '/storage/v1/object/authenticated/league-images/', 2) = storage.objects.name))
  )
);
