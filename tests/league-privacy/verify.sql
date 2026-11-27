-- Raises on every failed assertion, independent of plpgsql.check_asserts.
create function public.test_expect(ok boolean, reason text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'Failed: %',reason; end if; end $$;
insert into public.leagues(id) values ('00000000-0000-4000-a000-000000000002');
select test_expect((select not is_public from leagues where id::text like '%002'),'new leagues private');
select test_expect((select is_public from leagues where id::text like '%001'),'existing league visibility preserved');
select test_expect((select not public from storage.buckets where id='league-images'),'bucket private');
set test.storage_operation='storage.object.get_authenticated';
set role anon;
select test_expect((select count(*)=1 from storage.objects),'only the published team logo');
select test_expect(not has_function_privilege(current_user,'public.remove_league_admin(uuid,text)','EXECUTE'),'anon cannot revoke');
set test.storage_operation='storage.object.sign';
select test_expect((select count(*)=0 from storage.objects),'visitor cannot authorize signed links');
set test.storage_operation='storage.object.get_authenticated';
reset role;
set role authenticated;
set request.jwt.claim.sub='00000000-0000-4000-a000-000000000013';
do $$ begin
  perform public.set_league_visibility('00000000-0000-4000-a000-000000000001',false);
  raise exception 'another owner changed visibility';
exception when insufficient_privilege then null; end $$;
set request.jwt.claim.sub='00000000-0000-4000-a000-000000000011';
select set_league_visibility('00000000-0000-4000-a000-000000000001',false);
select test_expect((select count(*)=2 from storage.objects),'owner sees private and draft images');
set test.storage_operation='storage.object.sign_many';
select test_expect((select count(*)=0 from storage.objects),'admin grant cannot issue durable bearer links');
set test.storage_operation='storage.object.get_authenticated';
do $$ begin
  perform remove_league_admin('00000000-0000-4000-a000-000000000001','owner@example.test');
  raise exception using errcode='XX000',message='owner was removed';
exception when raise_exception then null; end $$;
set request.jwt.claim.sub='00000000-0000-4000-a000-000000000012';
select test_expect((select count(*)=2 from storage.objects),'manager sees private files');
with edited as (update public.matches set venue='Antes de revocar' returning 1)
select test_expect(count(*)=1,'manager may edit before revocation') from edited;
do $$ begin
  perform remove_league_admin('00000000-0000-4000-a000-000000000001','other@example.test');
  raise exception 'admin could revoke';
exception when insufficient_privilege then null; end $$;
set request.jwt.claim.sub='00000000-0000-4000-a000-000000000011';
select remove_league_admin('00000000-0000-4000-a000-000000000001',' Admin@example.test ');
set request.jwt.claim.sub='00000000-0000-4000-a000-000000000012';
select test_expect((select count(*)=0 from storage.objects),'revoked identity loses access without changing token');
with edited as (update public.matches set venue='Después de revocar' returning 1)
select test_expect(count(*)=0,'same identity cannot edit after revocation') from edited;
reset role;
set role anon;
select test_expect((select count(*)=0 from storage.objects),'private league hidden from visitors');
reset role;
