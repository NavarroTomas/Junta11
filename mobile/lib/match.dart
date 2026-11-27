import 'package:material_ui/material_ui.dart';

import 'api.dart';
import 'panel.dart';
import 'widgets.dart';

class NewMatch extends StatefulWidget {
  const NewMatch(this.api, this.league, this.data, {super.key});
  final LeagueApi api;
  final DbRow league;
  final LeagueData data;
  @override
  State<NewMatch> createState() => _NewMatchState();
}

class _NewMatchState extends State<NewMatch> {
  int step = 0;
  DateTime? date;
  String home = '', away = '', venue = '', error = '';
  bool busy = false;
  late final participants = <String>{
    for (final p in widget.data['players']) p['id'] as String,
  };
  List<String> sides = [];
  late String competition =
      widget.data['competitions'].firstOrNull?['id'] ?? '';
  bool get friends => widget.league['mode'] == 'players';
  void split() {
    sides = participants.toList()..shuffle();
  }

  Future<void> pick() async {
    final day = await showDatePicker(
      context: context,
      initialDate: date ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (day == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: date == null
          ? TimeOfDay.now()
          : TimeOfDay.fromDateTime(date!),
    );
    if (time != null && mounted)
      setState(
        () => date = DateTime(
          day.year,
          day.month,
          day.day,
          time.hour,
          time.minute,
        ),
      );
  }

  Future<void> next() async {
    setState(() => error = '');
    if (step == 1) {
      if (friends && participants.length < 2 ||
          !friends && (home.isEmpty || away.isEmpty || home == away)) {
        setState(
          () => error = friends
              ? 'Elegí al menos dos jugadores.'
              : 'Elegí dos equipos diferentes.',
        );
        return;
      }
      if (friends) split();
    }
    if (step < 2) {
      setState(() => step++);
      return;
    }
    if (competition.isEmpty) {
      setState(() => error = 'La liga necesita una competencia.');
      return;
    }
    if (busy) return;
    setState(() => busy = true);
    final start = date?.toUtc().toIso8601String(),
        mid = (sides.length + 1) ~/ 2;
    try {
      if (friends) {
        await widget.api.rpc('create_friendly_match', {
          'p_league_id': widget.league['id'],
          'p_home_label': 'Equipo A',
          'p_away_label': 'Equipo B',
          'p_home_players': sides.take(mid).toList(),
          'p_away_players': sides.skip(mid).toList(),
          'p_starts_at': start,
          'p_venue': venue.trim(),
          'p_round': 1,
        });
      } else {
        await widget.api.save('matches', widget.league['id'], {
          'competition_id': competition,
          'round': 1,
          'home_team_id': home,
          'away_team_id': away,
          'starts_at': start,
          'venue': venue.trim(),
        });
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) setState(() => error = message(e));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.data;
    final teams = d['teams'].where((r) => r['is_active'] != false);
    return FormPage(
      ['¿Cuándo juegan?', '¿Quiénes juegan?', 'Detalles del partido'][step],
      [
        Text('Paso ${step + 1} de 3'),
        if (step == 0)
          OutlinedButton(
            onPressed: pick,
            child: Text(
              date == null
                  ? 'Elegir día y hora'
                  : '${date!.day}/${date!.month}/${date!.year} · ${TimeOfDay.fromDateTime(date!).format(context)}',
            ),
          ),
        if (step == 1 && friends) ...[
          for (final pos
              in d['players']
                  .map((p) => p['position'] ?? 'Sin definir')
                  .toSet())
            ExpansionTile(
              initiallyExpanded: true,
              title: Text(pos),
              children: [
                Wrap(
                  spacing: 8,
                  children: [
                    for (final p in d['players'].where(
                      (r) => (r['position'] ?? 'Sin definir') == pos,
                    ))
                      FilterChip(
                        label: Text(p['name']),
                        selected: participants.contains(p['id']),
                        selectedColor: orange,
                        onSelected: (s) => setState(
                          () => s
                              ? participants.add(p['id'])
                              : participants.remove(p['id']),
                        ),
                      ),
                  ],
                ),
              ],
            ),
        ],
        if (step == 1 && !friends)
          for (final local in [true, false])
            DropdownButtonFormField<String>(
              key: ValueKey(local),
              initialValue: (local ? home : away).isEmpty
                  ? null
                  : (local ? home : away),
              decoration: InputDecoration(
                labelText: local ? 'Local' : 'Visitante',
              ),
              items: [
                for (final team in teams)
                  DropdownMenuItem(
                    value: team['id'] as String,
                    child: Text(team['name']),
                  ),
              ],
              onChanged: (v) => setState(() => local ? home = v! : away = v!),
            ),
        if (step == 2) ...[
          if (!friends && d['competitions'].length > 1)
            DropdownButtonFormField(
              initialValue: competition,
              items: [
                for (final c in d['competitions'])
                  DropdownMenuItem(
                    value: c['id'] as String,
                    child: Text(c['name']),
                  ),
              ],
              onChanged: (v) => setState(() => competition = v!),
            ),
          if (friends) ...[
            for (final a in [true, false])
              Card(
                child: ListTile(
                  title: Text(a ? 'Equipo A' : 'Equipo B'),
                  subtitle: Text(
                    (a
                            ? sides.take((sides.length + 1) ~/ 2)
                            : sides.skip((sides.length + 1) ~/ 2))
                        .map((id) => d.name('players', id, ''))
                        .join(' · '),
                  ),
                ),
              ),
            OutlinedButton(
              onPressed: () => setState(split),
              child: const Text('Volver a repartir'),
            ),
          ] else
            Text(
              '${d.name('teams', home, 'Local')} vs. ${d.name('teams', away, 'Visitante')}',
            ),
          TextFormField(
            initialValue: venue,
            decoration: const InputDecoration(labelText: 'Cancha (opcional)'),
            onChanged: (v) => venue = v,
          ),
        ],
        if (error.isNotEmpty) Text(error),
        OutlinedButton(
          onPressed: busy ? null : next,
          child: Text(
            step == 2
                ? 'Guardar partido'
                : step == 0 && date == null
                ? 'Definir fecha después'
                : 'Continuar',
          ),
        ),
        if (step > 0)
          TextButton(
            onPressed: busy ? null : () => setState(() => step--),
            child: const Text('Atrás'),
          ),
      ],
    );
  }
}

class MatchResult extends StatefulWidget {
  const MatchResult(
    this.api,
    this.match,
    this.data,
    this.home,
    this.away, {
    super.key,
  });
  final LeagueApi api;
  final DbRow match;
  final LeagueData data;
  final String home, away;
  @override
  State<MatchResult> createState() => _ResultState();
}

class _ResultState extends State<MatchResult> {
  late String home = widget.match['home_score']?.toString() ?? '',
      away = widget.match['away_score']?.toString() ?? '';
  late final stats = [
    for (final s in widget.data['match_players'].where(
      (r) => r['match_id'] == widget.match['id'],
    ))
      {
        for (final k in [
          'player_id',
          'side',
          'goals',
          'assists',
          'yellow_cards',
          'red_cards',
          'rating',
        ])
          k: s[k],
      },
  ];
  bool busy = false;
  String error = '';
  Future<void> save() async {
    final h = int.tryParse(home), a = int.tryParse(away);
    if (h == null || a == null || h < 0 || a < 0) {
      setState(
        () => error = 'Completá ambos goles con números positivos o cero.',
      );
      return;
    }
    if (busy) return;
    setState(() => busy = true);
    try {
      await widget.api.rpc('save_match_result', {
        'p_match_id': widget.match['id'],
        'p_home': h,
        'p_away': a,
        'p_players': stats,
      });
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) setState(() => error = message(e));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => FormPage('Resultado', [
    for (final local in [true, false])
      TextFormField(
        initialValue: local ? home : away,
        keyboardType: TextInputType.number,
        decoration: InputDecoration(
          labelText: local ? widget.home : widget.away,
        ),
        onChanged: (v) => local ? home = v : away = v,
      ),
    for (final local in [true, false])
      ExpansionTile(
        title: Text(local ? widget.home : widget.away),
        children: [
          for (final s in stats.where(
            (r) => r['side'] == (local ? 'home' : 'away'),
          ))
            ExpansionTile(
              key: ValueKey(s['player_id']),
              title: Text(
                widget.data.name('players', s['player_id'], 'Jugador'),
              ),
              children: [
                for (final field in const {
                  'goals': 'Goles',
                  'assists': 'Asistencias',
                  'yellow_cards': 'Amarillas',
                  'red_cards': 'Rojas',
                  'rating': 'Nota',
                }.entries)
                  TextFormField(
                    initialValue: s[field.key]?.toString() ?? '',
                    decoration: InputDecoration(labelText: field.value),
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    onChanged: (v) => s[field.key] = field.key == 'rating'
                        ? num.tryParse(v)
                        : int.tryParse(v) ?? 0,
                  ),
                TextButton(
                  onPressed: () => setState(() => stats.remove(s)),
                  child: const Text('Quitar participación'),
                ),
              ],
            ),
          Builder(
            builder: (_) {
              final choices = widget.data['players'].where(
                (p) =>
                    !stats.any((r) => r['player_id'] == p['id']) &&
                    (widget.match['home_team_id'] == null ||
                        p['team_id'] ==
                            widget.match[local
                                ? 'home_team_id'
                                : 'away_team_id']),
              );
              return DropdownButton<String>(
                value: null,
                hint: const Text('Agregar participante'),
                items: [
                  for (final p in choices)
                    DropdownMenuItem(
                      value: p['id'] as String,
                      child: Text(p['name']),
                    ),
                ],
                onChanged: (id) {
                  if (id != null)
                    setState(
                      () => stats.add({
                        'player_id': id,
                        'side': local ? 'home' : 'away',
                        'goals': 0,
                        'assists': 0,
                        'yellow_cards': 0,
                        'red_cards': 0,
                        'rating': null,
                      }),
                    );
                },
              );
            },
          ),
        ],
      ),
    if (error.isNotEmpty) Text(error),
    OutlinedButton(
      onPressed: busy ? null : save,
      child: const Text('Guardar resultado'),
    ),
  ]);
}
