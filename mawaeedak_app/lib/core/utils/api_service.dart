import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  String? _refreshToken;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(AppConstants.tokenKey);
    _refreshToken = prefs.getString(AppConstants.refreshTokenKey);
  }

  Future<Map<String, String>> _getHeaders({bool auth = false}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (auth && _token != null) {
      headers['Authorization'] = 'Bearer $_token';
    }
    return headers;
  }

  Future<ApiResponse> get(String endpoint, {bool auth = false, Map<String, String>? queryParams}) async {
    try {
      var uri = Uri.parse('${AppConstants.baseUrl}$endpoint');
      if (queryParams != null) {
        uri = uri.replace(queryParameters: queryParams);
      }
      final response = await http.get(
        uri,
        headers: await _getHeaders(auth: auth),
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  Future<ApiResponse> post(String endpoint, {Map<String, dynamic>? body, bool auth = false}) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}$endpoint'),
        headers: await _getHeaders(auth: auth),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  Future<ApiResponse> put(String endpoint, {Map<String, dynamic>? body, bool auth = false}) async {
    try {
      final response = await http.put(
        Uri.parse('${AppConstants.baseUrl}$endpoint'),
        headers: await _getHeaders(auth: auth),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  Future<ApiResponse> patch(String endpoint, {Map<String, dynamic>? body, bool auth = false}) async {
    try {
      final response = await http.patch(
        Uri.parse('${AppConstants.baseUrl}$endpoint'),
        headers: await _getHeaders(auth: auth),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  Future<ApiResponse> delete(String endpoint, {bool auth = false}) async {
    try {
      final response = await http.delete(
        Uri.parse('${AppConstants.baseUrl}$endpoint'),
        headers: await _getHeaders(auth: auth),
      ).timeout(const Duration(seconds: 30));
      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(success: false, error: e.toString());
    }
  }

  ApiResponse _handleResponse(http.Response response) {
    final body = response.body.isNotEmpty ? jsonDecode(response.body) : {};
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return ApiResponse(success: true, data: body);
    } else {
      return ApiResponse(
        success: false,
        error: body['error'] ?? 'حدث خطأ',
        statusCode: response.statusCode,
      );
    }
  }

  Future<void> setToken(String token, String refreshToken) async {
    _token = token;
    _refreshToken = refreshToken;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.tokenKey, token);
    await prefs.setString(AppConstants.refreshTokenKey, refreshToken);
  }

  Future<void> clearTokens() async {
    _token = null;
    _refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.refreshTokenKey);
  }

  bool get isAuthenticated => _token != null;
}

class ApiResponse {
  final bool success;
  final dynamic data;
  final String? error;
  final int? statusCode;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.statusCode,
  });
}
