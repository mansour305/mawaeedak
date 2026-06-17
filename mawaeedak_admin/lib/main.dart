import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/api_service.dart';
import 'screens/auth/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService().init();
  runApp(const MawaeedakAdminApp());
}

class MawaeedakAdminApp extends StatelessWidget {
  const MawaeedakAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'لوحة تحكم مواعيدك',
      debugShowCheckedModeBanner: false,
      theme: AdminTheme.lightTheme,
      locale: const Locale('ar', 'SA'),
      supportedLocales: const [Locale('ar', 'SA')],
      home: const LoginScreen(),
    );
  }
}