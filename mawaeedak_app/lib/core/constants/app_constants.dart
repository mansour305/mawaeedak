class AppConstants {
  static const String appName = 'مواعيدك';
  static const String appVersion = '1.0.0';
  
  // API Base URL - Update this for production
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  
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
}
