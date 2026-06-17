class AppConstants {
  static const String appName = 'لوحة تحكم مواعيدك';
  static const String appVersion = '3.0.0';
  
  // API Base URL - Set via --dart-define=API_BASE_URL=https://api.example.com/api
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );
  
  static const String tokenKey = 'admin_token';
  static const String adminKey = 'admin_data';
}
