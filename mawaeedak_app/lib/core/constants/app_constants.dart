class AppConstants {
  static const String appName = 'مواعيدك';
  static const String appVersion = '3.0.0';
  
  // API Base URL - Set via --dart-define=API_BASE_URL=https://api.example.com/api
  // Default for development only
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );
  
  // Production/Staging URLs (for reference)
  static const String productionApiUrl = 'https://api.mawaeedak.com/api';
  static const String stagingApiUrl = 'http://staging.mawaeedak.com/api';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';
  static const String isGuestKey = 'is_guest';
  static const String onboardingKey = 'onboarding_completed';
  
  // API Endpoints
  static const String authLogin = '/auth/login';
  static const String authAdminLogin = '/auth/admin/login';
  static const String authRegister = '/auth/register';
  static const String authLogout = '/auth/logout';
  static const String authRefresh = '/auth/refresh';
  static const String salaries = '/salaries';
  static const String supports = '/supports';
  static const String calendar = '/calendar';
  static const String services = '/services';
  static const String trips = '/trips';
  static const String notifications = '/notifications';
  static const String news = '/news';
  static const String jobs = '/jobs';
  static const String settings = '/settings';
  static const String users = '/users';
  
  // Prayer Times (Saudi Arabia - Riyadh)
  static const double latitude = 24.7136;
  static const double longitude = 46.6753;
  static const String calculationMethod = 'UmmAlQura';
  
  // Timeouts (ms)
  static const int connectionTimeout = 30000;
  static const int receiveTimeout = 30000;
  
  // Pagination
  static const int defaultPageSize = 20;
}
