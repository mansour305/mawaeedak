import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

class AppState extends ChangeNotifier {
  final AuthRepository _authRepository = AuthRepository();
  
  User? _user;
  bool _isLoggedIn = false;
  bool _isGuest = true;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoggedIn => _isLoggedIn;
  bool get isGuest => _isGuest;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();
    
    _isLoggedIn = await _authRepository.isLoggedIn();
    _isGuest = await _authRepository.isGuest();
    
    if (_isLoggedIn) {
      _user = await _authRepository.getCurrentUser();
    }
    
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String phone, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final user = await _authRepository.login(phone, password);
      if (user != null) {
        _user = user;
        _isLoggedIn = true;
        _isGuest = false;
        await _authRepository.setGuestMode(false);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = 'فشل تسجيل الدخول. تأكد من رقم الهاتف وكلمة المرور';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String phone, String password, {String? email}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final user = await _authRepository.register(name, phone, password, email: email);
      if (user != null) {
        _user = user;
        _isLoggedIn = true;
        _isGuest = false;
        await _authRepository.setGuestMode(false);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = 'فشل إنشاء الحساب. قد يكون رقم الهاتف مسجلاً مسبقاً';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    
    await _authRepository.logout();
    _user = null;
    _isLoggedIn = false;
    _isGuest = true;
    
    _isLoading = false;
    notifyListeners();
  }

  void setAsGuest() {
    _isGuest = true;
    _authRepository.setGuestMode(true);
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
