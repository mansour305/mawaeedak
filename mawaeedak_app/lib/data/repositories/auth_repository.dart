import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/api_service.dart';
import '../models/user_model.dart';

class AuthRepository {
  final ApiService _apiService = ApiService();

  Future<User?> login(String phone, String password) async {
    final response = await _apiService.post(
      AppConstants.authLogin,
      body: {'phone': phone, 'password': password},
    );
    
    if (response.success && response.data['success'] == true) {
      await _apiService.setToken(
        response.data['token'],
        response.data['refreshToken'],
      );
      await _saveUser(response.data['user']);
      return User.fromJson(response.data['user']);
    }
    return null;
  }

  Future<User?> register(String name, String phone, String password, {String? email}) async {
    final response = await _apiService.post(
      AppConstants.authRegister,
      body: {
        'name': name,
        'phone': phone,
        'password': password,
        if (email != null) 'email': email,
      },
    );
    
    if (response.success && response.data['success'] == true) {
      await _apiService.setToken(
        response.data['token'],
        response.data['refreshToken'] ?? '',
      );
      await _saveUser(response.data['user']);
      return User.fromJson(response.data['user']);
    }
    return null;
  }

  Future<bool> logout() async {
    try {
      await _apiService.post(AppConstants.authLogout, auth: true);
    } catch (_) {}
    await _apiService.clearTokens();
    await _clearUser();
    return true;
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString(AppConstants.userKey);
    if (userData != null) {
      return User.fromStoredJson(jsonDecode(userData));
    }
    return null;
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.tokenKey);
    return token != null && token.isNotEmpty;
  }

  Future<bool> isGuest() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(AppConstants.isGuestKey) ?? true;
  }

  Future<void> setGuestMode(bool isGuest) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.isGuestKey, isGuest);
  }

  Future<void> _saveUser(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userKey, jsonEncode(userData));
  }

  Future<void> _clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.userKey);
    await prefs.setBool(AppConstants.isGuestKey, true);
  }
}
