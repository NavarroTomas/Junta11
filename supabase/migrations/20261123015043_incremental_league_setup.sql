-- 0 means the organizer has not estimated the final roster yet.
alter table public.leagues drop constraint leagues_expected_participants_check;
alter table public.leagues add constraint leagues_expected_participants_check
  check (expected_participants=0 or expected_participants between 2 and 128);

-- Withdrawal is reversible and never deletes historical relationships.
alter table public.teams add column is_active boolean not null default true;

do $migration$
declare definition text;
begin
 select pg_get_functiondef('public.generate_league_fixture(uuid)'::regprocedure) into definition;
 if strpos(definition,'from public.teams where league_id=p_league_id;')=0 then
  raise exception 'Unexpected fixture source; review before changing it.';
 end if;
 execute replace(definition,'from public.teams where league_id=p_league_id;',
  'from public.teams where league_id=p_league_id and is_active;');
end
$migration$;

-- Existing matches and results stay editable; only new fixtures exclude retired teams.
create function public.check_active_match_teams() returns trigger
language plpgsql set search_path='' as $function$
begin
 if new.home_team_id is not null and (
   not exists(select 1 from public.teams t where t.id=new.home_team_id and t.league_id=new.league_id and t.is_active)
   or not exists(select 1 from public.teams t where t.id=new.away_team_id and t.league_id=new.league_id and t.is_active)
 ) then
  raise exception 'Reactivá los equipos antes de programar un partido nuevo.';
 end if;
 return new;
end
$function$;
create trigger check_active_match_teams before insert on public.matches
for each row execute function public.check_active_match_teams();
