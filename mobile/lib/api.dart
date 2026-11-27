import 'package:supabase_flutter/supabase_flutter.dart';

typedef DbRow = Map<String, dynamic>;

class LeagueApi {
  LeagueApi(this.client);
  final SupabaseClient client;
  Future<void> login(String email, String password) async {
    await client.auth.signInWithPassword(
      email: email.trim(),
      password: password,
    );
  }

  Future<void> logout() => client.auth.signOut(scope: SignOutScope.local);
  Future<List<DbRow>> leagues() async {
    final user = client.auth.currentUser;
    if (user == null) throw const AuthException('Ingresá para ver tus ligas.');
    final rows = await client
        .from('league_members')
        .select('league:leagues(id,name,slug,mode,description,is_public)')
        .eq('user_id', user.id)
        .timeout(const Duration(seconds: 20));
    return [
      for (final row in rows)
        if (row['league'] != null) row['league'] as DbRow,
    ];
  }

  Future<List<DbRow>> list(String table, String league) => client
      .from(table)
      .select()
      .eq('league_id', league)
      .order(table == 'match_players' ? 'player_id' : 'created_at')
      .timeout(const Duration(seconds: 20));
  Future<void> save(
    String table,
    String league,
    DbRow data, {
    String? id,
  }) async {
    final query = id == null
        ? client.from(table).insert({...data, 'league_id': league})
        : client.from(table).update(data).eq('id', id).eq('league_id', league);
    await query.select('id').single();
  }

  Future<void> rpc(String name, DbRow body) async {
    await client.rpc(name, params: body);
  }
}
