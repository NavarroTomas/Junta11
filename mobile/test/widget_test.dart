import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:junta11/home.dart';

void main() {
  test('Acepta un enlace de Junta11 o un identificador', () {
    expect(
      leagueSlug(' https://junta11.vercel.app/liga/barrio-11/ '),
      'barrio-11',
    );
    expect(leagueSlug('barrio-11'), 'barrio-11');
    expect(leagueSlug('https://otro.example/liga/barrio-11'), isNull);
    expect(leagueSlug(''), isNull);
  });
  testWidgets('Muestra empate sin confundir cero con dato faltante', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: MatchCard({
            'home_label': 'Norte',
            'away_label': 'Sur',
            'home_score': 0,
            'away_score': 0,
          }, result: true),
        ),
      ),
    );
    expect(find.textContaining('0 – 0'), findsOneWidget);
  });
  testWidgets('Distingue partido sin fecha de calendario vacío', (
    tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              MatchCard({
                'home_label': 'Norte',
                'away_label': 'Sur',
              }, result: false),
              MatchCard(null, result: true),
            ],
          ),
        ),
      ),
    );
    expect(find.text('Fecha a confirmar'), findsOneWidget);
    expect(find.text('Todavía no se cargaron resultados.'), findsOneWidget);
  });
}
