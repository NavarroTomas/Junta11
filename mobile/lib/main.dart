import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:material_ui/material_ui.dart';

import 'api.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

import 'home.dart';
import 'widgets.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  const environment = String.fromEnvironment(
    'JUNTA11_ENV',
    defaultValue: 'test',
  );
  final production = jsonDecode(
    await rootBundle.loadString('assets/platform.json'),
  );
  final String url;
  final String key;
  if (environment == 'production') {
    url = production['NEXT_PUBLIC_SUPABASE_URL'];
    key = production['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];
  } else {
    url = const String.fromEnvironment('JUNTA11_TEST_SUPABASE_URL');
    key = const String.fromEnvironment('JUNTA11_TEST_SUPABASE_PUBLISHABLE_KEY');
    final uri = Uri.tryParse(url);
    if (environment != 'test' ||
        uri == null ||
        !RegExp(r'^https://[a-z0-9]+\.supabase\.co$').hasMatch(url) ||
        uri.origin ==
            Uri.parse(production['NEXT_PUBLIC_SUPABASE_URL']).origin ||
        !RegExp(r'^sb_publishable_[A-Za-z0-9_-]+$').hasMatch(key)) {
      runApp(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: Text(
                'Configurá el proyecto de pruebas de Junta11 para iniciar la app.',
              ),
            ),
          ),
        ),
      );
      return;
    }
  }
  await Supabase.initialize(url: url, publishableKey: key);
  runApp(Junta11(LeagueApi(Supabase.instance.client)));
}

class Junta11 extends StatelessWidget {
  const Junta11(this.api, {super.key});
  final LeagueApi api;
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Junta11',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      colorScheme: ColorScheme.fromSeed(seedColor: orange),
      scaffoldBackgroundColor: Colors.white,
      appBarTheme: const AppBarTheme(backgroundColor: Colors.white),
      inputDecorationTheme: const InputDecorationTheme(
        border: UnderlineInputBorder(),
      ),
    ),
    home: StreamBuilder<AuthState>(
      stream: api.client.auth.onAuthStateChange,
      builder: (_, s) => api.client.auth.currentSession == null
          ? Login(api)
          : LeagueHome(api, key: ValueKey(api.client.auth.currentUser!.id)),
    ),
  );
}

class Login extends StatefulWidget {
  const Login(this.api, {super.key});
  final LeagueApi api;
  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final email = TextEditingController(), password = TextEditingController();
  bool busy = false, hidden = true;
  String error = '';
  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    if (busy) return;
    setState(() {
      busy = true;
      error = '';
    });
    try {
      await widget.api.login(email.text, password.text);
      password.clear();
    } catch (e) {
      if (mounted) setState(() => error = message(e));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => FormPage('Iniciar sesión', [
    TextField(
      controller: email,
      keyboardType: TextInputType.emailAddress,
      autofillHints: const [AutofillHints.email],
      decoration: const InputDecoration(labelText: 'Correo electrónico'),
    ),
    TextField(
      controller: password,
      obscureText: hidden,
      onSubmitted: (_) => submit(),
      decoration: InputDecoration(
        labelText: 'Contraseña',
        suffixIcon: IconButton(
          tooltip: hidden ? 'Mostrar contraseña' : 'Ocultar contraseña',
          onPressed: () => setState(() => hidden = !hidden),
          icon: Icon(
            hidden ? Icons.visibility_outlined : Icons.visibility_off_outlined,
          ),
        ),
      ),
    ),
    if (error.isNotEmpty) Text(error),
    OutlinedButton(
      onPressed: busy ? null : submit,
      child: Text(busy ? 'Ingresando…' : 'Ingresar'),
    ),
  ]);
}
