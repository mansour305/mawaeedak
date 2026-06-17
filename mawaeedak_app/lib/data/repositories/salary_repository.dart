import '../../core/constants/app_constants.dart';
import '../../core/utils/api_service.dart';
import '../models/salary_model.dart';

class SalaryRepository {
  final ApiService _apiService = ApiService();

  Future<List<Salary>> getSalaries({String? type, bool upcoming = false}) async {
    final queryParams = <String, String>{};
    if (type != null) queryParams['type'] = type;
    if (upcoming) queryParams['upcoming'] = 'true';
    
    final response = await _apiService.get(
      AppConstants.salaries,
      queryParams: queryParams.isNotEmpty ? queryParams : null,
    );
    
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => Salary.fromJson(e)).toList();
    }
    return [];
  }

  Future<Salary?> getSalaryById(String id) async {
    final response = await _apiService.get('${AppConstants.salaries}/$id');
    if (response.success && response.data['success'] == true) {
      return Salary.fromJson(response.data['data']);
    }
    return null;
  }

  Future<Salary?> getNearestPayment() async {
    final response = await _apiService.get('${AppConstants.salaries}/nearest/next');
    if (response.success && response.data['success'] == true && response.data['data'] != null) {
      return Salary.fromJson(response.data['data']);
    }
    return null;
  }

  Future<List<Support>> getSupports({String? type, bool upcoming = false}) async {
    final queryParams = <String, String>{};
    if (type != null) queryParams['type'] = type;
    if (upcoming) queryParams['upcoming'] = 'true';
    
    final response = await _apiService.get(
      AppConstants.supports,
      queryParams: queryParams.isNotEmpty ? queryParams : null,
    );
    
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => Support.fromJson(e)).toList();
    }
    return [];
  }

  Future<Support?> getSupportById(String id) async {
    final response = await _apiService.get('${AppConstants.supports}/$id');
    if (response.success && response.data['success'] == true) {
      return Support.fromJson(response.data['data']);
    }
    return null;
  }
}
