import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

import 'api.dart';
import 'widgets.dart';
import 'match.dart';

class LeagueData {
  LeagueData(this.tables);
  final Map<String, List<DbRow>> tables;
  List<DbRow> operator [](String name) => tables[name]!;
  String name(String table, dynamic id, String fallback) =>
      this[table].where((r) => r['id'] == id).firstOrNull?['name'] ?? fallback;
  static Future<LeagueData> load(LeagueApi api, String id) async {
    const names = [
      'teams',
      'players',
      'matches',
      'competitions',
      'match_players',
      'seasons',
      'news',
    ];
    final rows = await Future.wait(names.map((n) => api.list(n, id)));
    return LeagueData(Map.fromIterables(names, rows));
  }
}

class Panel extends StatefulWidget {
  const Panel(this.api, this.league, {super.key});
  final LeagueApi api;
  final DbRow league;
  @override
  State<Panel> createState() => _PanelState();
}

class _PanelState extends State<Panel> {
  late Future<LeagueData> data = load();
  Future<LeagueData> load() => LeagueData.load(widget.api, widget.league['id']);
  void reload() => setState(() => data = load());
  Future<void> open(Widget page) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => page));
    if (mounted) reload();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(widget.league['name']),
      actions: [
        IconButton(
          onPressed: reload,
          tooltip: 'Actualizar liga',
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: RequestView(
      request: data,
      retry: reload,
      builder: (d) {
        final league = widget.league;
        final cards = <(String, IconData, VoidCallback, bool)>[];
        void section(String title, IconData icon, String table) {
          cards.add((
            title,
            icon,
            () => open(LeagueSection(widget.api, league, table, title)),
            false,
          ));
        }

        section('Jugadores', Icons.people_outline, 'players');
        if (league['mode'] == 'teams')
          section('Equipos', Icons.shield_outlined, 'teams');
        section('Partidos', Icons.calendar_month_outlined, 'matches');
        cards.add((
          'Crear partido',
          Icons.event_available_outlined,
          () => open(NewMatch(widget.api, league, d)),
          true,
        ));
        cards.add((
          'Agregar jugador',
          Icons.person_add_alt,
          () => open(EntityEditor(widget.api, league, 'players', d)),
          true,
        ));
        section('Estadísticas', Icons.bar_chart, 'stats');
        section('Temporadas', Icons.emoji_events_outlined, 'seasons');
        section('Noticias', Icons.article_outlined, 'news');
        cards.add((
          'Enlace',
          Icons.link,
          () async {
            await Clipboard.setData(
              ClipboardData(
                text: Uri.https(
                  'junta11.vercel.app',
                  '/liga/${league['slug']}',
                ).toString(),
              ),
            );
            if (context.mounted)
              ScaffoldMessenger.of(
                context,
              ).showSnackBar(const SnackBar(content: Text('Enlace copiado')));
          },
          false,
        ));
        return CustomScrollView(
          slivers: [
            const SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Text(
                  'Administración',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverGrid.extent(
                maxCrossAxisExtent: 230,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                children: [
                  for (final c in cards)
                    OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: c.$4 ? orange : null,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      onPressed: c.$3,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(c.$2, size: 32),
                          const SizedBox(height: 12),
                          Text(
                            c.$1,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        );
      },
    ),
  );
}

class LeagueSection extends StatefulWidget {
  const LeagueSection(
    this.api,
    this.league,
    this.table,
    this.title, {
    super.key,
  });
  final LeagueApi api;
  final DbRow league;
  final String table, title;
  @override
  State<LeagueSection> createState() => _SectionState();
}

class _SectionState extends State<LeagueSection> {
  late Future<LeagueData> data = load();
  Future<LeagueData> load() => LeagueData.load(widget.api, widget.league['id']);
  void reload() => setState(() => data = load());
  Future<void> open(Widget page) async {
    await Navigator.push(context, MaterialPageRoute(builder: (_) => page));
    if (mounted) reload();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: Text(widget.title),
      actions: [
        IconButton(
          tooltip: 'Actualizar',
          onPressed: reload,
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: RequestView(
      request: data,
      retry: reload,
      builder: (d) {
        final t = widget.table,
            editable = ['players', 'teams', 'news'].contains(t);
        final items = <Widget>[];
        if (t == 'stats') {
          for (final p in d['players']) {
            final lines = d['match_players'].where(
              (s) =>
                  s['player_id'] == p['id'] &&
                  d['matches'].any(
                    (m) =>
                        m['id'] == s['match_id'] && m['status'] == 'completed',
                  ),
            );
            final goals = lines.fold<int>(0, (v, r) => v + (r['goals'] as int));
            items.add(
              ListTile(
                title: Text(p['name']),
                subtitle: Text('${lines.length} PJ · $goals goles'),
              ),
            );
          }
        } else {
          for (final r in d[t]) {
            if (t == 'teams' && r['is_active'] == false) continue;
            if (t == 'matches') {
              final home = d.name(
                    'teams',
                    r['home_team_id'],
                    r['home_label'] ?? 'Equipo A',
                  ),
                  away = d.name(
                    'teams',
                    r['away_team_id'],
                    r['away_label'] ?? 'Equipo B',
                  );
              items.add(
                ListTile(
                  title: Text('$home · $away'),
                  subtitle: Text(
                    r['status'] == 'completed'
                        ? "${r['home_score']} – ${r['away_score']}"
                        : 'Programado',
                  ),
                  onTap: () => open(MatchResult(widget.api, r, d, home, away)),
                ),
              );
            } else {
              final subtitle = t == 'players'
                  ? [
                      r['position'],
                      d.name('teams', r['team_id'], ''),
                    ].where((s) => s != null && s != '').join(' · ')
                  : t == 'news'
                  ? (r['published'] == true ? 'Publicada' : 'Borrador')
                  : '';
              items.add(
                ListTile(
                  title: Text(r['name'] ?? r['title']),
                  subtitle: subtitle.isEmpty ? null : Text(subtitle),
                  onTap: editable
                      ? () => open(
                          EntityEditor(widget.api, widget.league, t, d, row: r),
                        )
                      : null,
                ),
              );
            }
          }
        }
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (editable || t == 'matches')
              Align(
                alignment: Alignment.centerRight,
                child: OutlinedButton(
                  onPressed: () => open(
                    t == 'matches'
                        ? NewMatch(widget.api, widget.league, d)
                        : EntityEditor(widget.api, widget.league, t, d),
                  ),
                  child: Text(t == 'matches' ? 'Crear partido' : 'Agregar'),
                ),
              ),
            if (items.isEmpty)
              const Padding(
                padding: EdgeInsets.all(20),
                child: Text('Sin registros.'),
              ),
            ...items,
          ],
        );
      },
    ),
  );
}

class EntityEditor extends StatefulWidget {
  const EntityEditor(
    this.api,
    this.league,
    this.table,
    this.data, {
    this.row,
    super.key,
  });
  final LeagueApi api;
  final DbRow league;
  final String table;
  final LeagueData data;
  final DbRow? row;
  @override
  State<EntityEditor> createState() => _EditorState();
}

class _EditorState extends State<EntityEditor> {
  late String name = widget.row?['name'] ?? widget.row?['title'] ?? '',
      body = widget.row?['body'] ?? '',
      position = widget.row?['position'] ?? 'Sin definir',
      team = widget.row?['team_id'] ?? '';
  late bool published = widget.row?['published'] ?? false;
  bool busy = false;
  String error = '';
  Future<void> save() async {
    if (busy) return;
    if (name.trim().isEmpty ||
        (widget.table == 'news' && body.trim().isEmpty)) {
      setState(() => error = 'Completá los campos.');
      return;
    }
    setState(() {
      busy = true;
      error = '';
    });
    try {
      final value = switch (widget.table) {
        'news' => {
          'title': name.trim(),
          'body': body.trim(),
          'published': published,
        },
        'players' => {
          'name': name.trim(),
          'position': position,
          'team_id': team.isEmpty ? null : team,
        },
        _ => {
          'name': name.trim(),
          if (widget.row == null)
            'short_name': name
                .trim()
                .split(RegExp(r'\s+'))
                .map((w) => w[0])
                .take(4)
                .join()
                .toUpperCase(),
        },
      };
      await widget.api.save(
        widget.table,
        widget.league['id'],
        value,
        id: widget.row?['id'],
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) setState(() => error = message(e));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final news = widget.table == 'news';
    final noun = {
      'players': 'jugador',
      'teams': 'equipo',
      'news': 'noticia',
    }[widget.table];
    return FormPage('${widget.row == null ? 'Agregar' : 'Editar'} $noun', [
      TextFormField(
        initialValue: name,
        maxLength: news ? 120 : 80,
        decoration: InputDecoration(labelText: news ? 'Título' : 'Nombre'),
        onChanged: (v) => name = v,
      ),
      if (widget.table == 'players') ...[
        DropdownButtonFormField(
          initialValue: position,
          decoration: const InputDecoration(labelText: 'Posición'),
          items: [
            for (final p in {
              'Sin definir',
              'Arquero',
              'Defensor',
              'Mediocampista',
              'Delantero',
              position,
            })
              DropdownMenuItem(value: p, child: Text(p)),
          ],
          onChanged: (v) => setState(() => position = v!),
        ),
        if (widget.league['mode'] == 'teams')
          DropdownButtonFormField(
            initialValue: team,
            decoration: const InputDecoration(labelText: 'Equipo'),
            items: [
              const DropdownMenuItem(value: '', child: Text('Sin equipo')),
              for (final t in widget.data['teams'].where(
                (r) => r['is_active'] != false || r['id'] == team,
              ))
                DropdownMenuItem(
                  value: t['id'] as String,
                  child: Text(t['name']),
                ),
            ],
            onChanged: (v) => setState(() => team = v!),
          ),
      ],
      if (news) ...[
        TextFormField(
          initialValue: body,
          minLines: 3,
          maxLines: 8,
          decoration: const InputDecoration(labelText: 'Contenido'),
          onChanged: (v) => body = v,
        ),
        SwitchListTile(
          title: const Text('Publicada'),
          value: published,
          onChanged: (v) => setState(() => published = v),
        ),
      ],
      if (error.isNotEmpty) Text(error),
      OutlinedButton(
        onPressed: busy ? null : save,
        child: Text(busy ? 'Guardando…' : 'Guardar'),
      ),
    ]);
  }
}
