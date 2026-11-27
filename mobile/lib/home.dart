import 'package:material_ui/material_ui.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api.dart';
import 'panel.dart';
import 'widgets.dart';

String? leagueSlug(String input) {
  final value = input.trim();
  final uri = Uri.tryParse(value);
  final parts = uri?.pathSegments.where((s) => s.isNotEmpty).toList();
  final slug =
      uri?.scheme == 'https' &&
          uri?.host == 'junta11.vercel.app' &&
          parts?.length == 2 &&
          parts!.first == 'liga'
      ? parts.last
      : value;
  return RegExp(r'^[a-z0-9]+(?:-[a-z0-9]+)*$').hasMatch(slug) ? slug : null;
}

class LeagueHome extends StatefulWidget {
  const LeagueHome(this.api, {super.key});
  final LeagueApi api;
  @override
  State<LeagueHome> createState() => _LeagueHomeState();
}

typedef HomeLeagues = ({List<DbRow> managed, DbRow? active});

class _LeagueHomeState extends State<LeagueHome> {
  late final prefKey = 'home.league.${widget.api.client.auth.currentUser!.id}';
  final prefs = SharedPreferencesAsync();
  late Future<HomeLeagues> data = load();

  Future<DbRow?> publicLeague(String slug) => widget.api.client
      .from('leagues')
      .select('id,name,slug')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle()
      .timeout(const Duration(seconds: 20));

  Future<HomeLeagues> load() async {
    final key = prefKey;
    final managed = await widget.api.leagues();
    managed.sort((a, b) => a['name'].compareTo(b['name']) as int);
    final slug = await prefs.getString(key);
    final saved = managed.where((l) => l['slug'] == slug).firstOrNull;
    final active =
        saved ??
        (slug == null ? null : await publicLeague(slug)) ??
        managed.firstOrNull;
    return (managed: managed, active: active);
  }

  void reload() => setState(() => data = load());
  Future<void> selectLeague(DbRow league) async {
    await prefs.setString(prefKey, league['slug']);
    if (mounted) reload();
  }

  Future<void> follow() async {
    final slug = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (_) => const OpenLeague()),
    );
    if (!mounted || slug == null) return;
    try {
      final league = await publicLeague(slug);
      if (league == null) {
        throw Exception('No encontramos una liga pública con ese enlace.');
      }
      if (mounted) await selectLeague(league);
    } catch (e) {
      showError(e);
    }
  }

  void showError(Object e) {
    if (mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(message(e))));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Inicio'),
      actions: [
        IconButton(
          tooltip: 'Actualizar',
          icon: const Icon(Icons.refresh),
          onPressed: reload,
        ),
        IconButton(
          tooltip: 'Cerrar sesión',
          icon: const Icon(Icons.logout),
          onPressed: () async {
            try {
              await widget.api.logout();
            } catch (e) {
              showError(e);
            }
          },
        ),
      ],
    ),
    body: RequestView(
      request: data,
      retry: reload,
      builder: (home) {
        final league = home.active;
        if (league == null) {
          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              Text(
                'Todavía no tenés una liga',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const Text(
                'Pedile al organizador el enlace público para seguir los partidos desde tu inicio.',
              ),
              FilledButton(
                onPressed: follow,
                child: const Text('Abrir una liga'),
              ),
            ],
          );
        }
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              league['name'],
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            MatchHighlights(widget.api, league['id'], key: ObjectKey(home)),
            if (home.managed.any((l) => l['id'] == league['id']))
              OutlinedButton(
                onPressed: () async {
                  await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => Panel(widget.api, league),
                    ),
                  );
                  if (mounted) reload();
                },
                child: const Text('Administrar liga'),
              ),
            if (home.managed.any((l) => l['id'] != league['id']))
              PopupMenuButton<DbRow>(
                tooltip: 'Cambiar liga',
                onSelected: (l) async {
                  try {
                    await selectLeague(l);
                  } catch (e) {
                    showError(e);
                  }
                },
                itemBuilder: (_) => [
                  for (final l in home.managed)
                    PopupMenuItem(value: l, child: Text(l['name'])),
                ],
                child: const ListTile(
                  leading: Icon(Icons.swap_horiz),
                  title: Text('Cambiar liga'),
                ),
              ),
            TextButton(
              onPressed: follow,
              child: const Text('Abrir otra liga por enlace'),
            ),
          ],
        );
      },
    ),
  );
}

class OpenLeague extends StatefulWidget {
  const OpenLeague({super.key});
  @override
  State<OpenLeague> createState() => _OpenLeagueState();
}

class _OpenLeagueState extends State<OpenLeague> {
  String value = '';
  String? error;
  void submit() {
    final slug = leagueSlug(value);
    if (slug == null) {
      setState(
        () => error = 'Ingresá el enlace público o el nombre que aparece al final del enlace.',
      );
      return;
    }
    Navigator.pop(context, slug);
  }

  @override
  Widget build(BuildContext context) => FormPage('Abrir una liga', [
    TextField(
      autofocus: true,
      onChanged: (s) => value = s,
      onSubmitted: (_) => submit(),
      decoration: InputDecoration(
        labelText: 'Enlace o identificador',
        hintText: 'junta-del-barrio',
        errorText: error,
      ),
    ),
    FilledButton(onPressed: submit, child: const Text('Ver liga')),
  ]);
}

class MatchHighlights extends StatefulWidget {
  const MatchHighlights(this.api, this.leagueId, {super.key});
  final LeagueApi api;
  final String leagueId;
  @override
  State<MatchHighlights> createState() => _HighlightsState();
}

class _HighlightsState extends State<MatchHighlights> {
  late var data = load();
  Future<List<DbRow?>> load() async {
    final db = widget.api.client;
    const fields =
        'id,round,starts_at,venue,home_score,away_score,home_label,away_label,home_team_id,away_team_id';
    final matches = db.from('matches');
    final base = matches.select(fields).eq('league_id', widget.leagueId);
    final next = base
        .eq('status', 'scheduled')
        .gte('starts_at', DateTime.now().toUtc().toIso8601String())
        .order('starts_at')
        .order('id')
        .limit(1)
        .maybeSingle();
    final latest = base
        .eq('status', 'completed')
        .not('home_score', 'is', null)
        .not('away_score', 'is', null)
        .order('starts_at', ascending: false, nullsFirst: false)
        .order('created_at', ascending: false)
        .order('id')
        .limit(1)
        .maybeSingle();
    final rows = await Future.wait([next, latest])
        .timeout(const Duration(seconds: 20));
    rows[0] ??= await base
        .eq('status', 'scheduled')
        .isFilter('starts_at', null)
        .order('round')
        .order('id')
        .limit(1)
        .maybeSingle()
        .timeout(const Duration(seconds: 20));
    final ids = {
      for (final m in rows.nonNulls)
        ...[m['home_team_id'], m['away_team_id']].nonNulls,
    };
    if (ids.isNotEmpty) {
      final teams = await db
          .from('teams')
          .select('id,name')
          .eq('league_id', widget.leagueId)
          .inFilter('id', ids.toList())
          .timeout(const Duration(seconds: 20));
      final names = {for (final t in teams) t['id']: t['name']};
      for (final m in rows.nonNulls) {
        for (final side in ['home', 'away']) {
          m['${side}_label'] =
              names[m['${side}_team_id']] ?? m['${side}_label'];
        }
      }
    }
    return rows;
  }

  @override
  Widget build(BuildContext context) => RequestView(
    request: data,
    retry: () => setState(() => data = load()),
    builder: (rows) => Column(
      children: [
        MatchCard(rows[0], result: false),
        MatchCard(rows[1], result: true),
      ],
    ),
  );
}

class MatchCard extends StatelessWidget {
  const MatchCard(this.match, {required this.result, super.key});
  final DbRow? match;
  final bool result;
  @override
  Widget build(BuildContext context) {
    final row = match;
    final date = DateTime.tryParse(row?['starts_at'] ?? '')?.toLocal();
    String two(int i) => i.toString().padLeft(2, '0');
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: double.infinity,
              child: Text(
                result ? 'Último resultado' : 'Próximo partido',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            const SizedBox(height: 8),
            if (row == null)
              Text(
                result
                    ? 'Todavía no se cargaron resultados.'
                    : 'No hay partidos pendientes.',
              )
            else ...[
              Text(
                "${row['home_label'] ?? 'Local'}   ${result ? "${row['home_score']} – ${row['away_score']}" : 'vs.'}   ${row['away_label'] ?? 'Visitante'}",
                style: Theme.of(context).textTheme.titleLarge,
              ),
              if (date != null)
                Text(
                  '${two(date.day)}/${two(date.month)}/${date.year} · ${two(date.hour)}:${two(date.minute)}',
                )
              else if (!result)
                const Text('Fecha a confirmar'),
              if ((row['venue'] as String?)?.trim().isNotEmpty == true)
                Text(row['venue']),
            ],
          ],
        ),
      ),
    );
  }
}
