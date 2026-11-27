import 'package:material_ui/material_ui.dart';

const orange = Color(0xfff06a3d);
String message(Object error) =>
    error.toString().replaceFirst('Exception: ', '');

class RequestView<T> extends StatelessWidget {
  const RequestView({
    super.key,
    required this.request,
    required this.builder,
    required this.retry,
  });
  final Future<T> request;
  final Widget Function(T) builder;
  final VoidCallback retry;
  @override
  Widget build(BuildContext context) => FutureBuilder<T>(
    future: request,
    builder: (context, s) {
      if (s.connectionState != ConnectionState.done)
        return const Center(child: CircularProgressIndicator());
      if (s.hasError)
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(message(s.error!)),
              OutlinedButton(onPressed: retry, child: const Text('Reintentar')),
            ],
          ),
        );
      return builder(s.data as T);
    },
  );
}

class FormPage extends StatelessWidget {
  const FormPage(this.title, this.children, {super.key});
  final String title;
  final List<Widget> children;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(),
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(title, style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 24),
                for (final child in children)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: child,
                  ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
