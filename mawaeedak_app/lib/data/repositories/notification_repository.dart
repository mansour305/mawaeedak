import '../../core/constants/app_constants.dart';
import '../../core/utils/api_service.dart';
import '../models/event_model.dart';

class NotificationRepository {
  final ApiService _apiService = ApiService();

  Future<List<AppNotification>> getNotifications({bool unreadOnly = false, int? limit}) async {
    final queryParams = <String, String>{};
    if (unreadOnly) queryParams['unread_only'] = 'true';
    if (limit != null) queryParams['limit'] = limit.toString();
    
    final response = await _apiService.get(
      AppConstants.notifications,
      auth: true,
      queryParams: queryParams.isNotEmpty ? queryParams : null,
    );
    
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => AppNotification.fromJson(e)).toList();
    }
    return [];
  }

  Future<int> getUnreadCount() async {
    final response = await _apiService.get(AppConstants.notifications, auth: true);
    if (response.success && response.data['success'] == true) {
      return response.data['unread_count'] ?? 0;
    }
    return 0;
  }

  Future<bool> markAsRead(String id) async {
    final response = await _apiService.patch('${AppConstants.notifications}/$id/read', auth: true);
    return response.success && response.data['success'] == true;
  }

  Future<bool> markAllAsRead() async {
    final response = await _apiService.patch('${AppConstants.notifications}/read-all', auth: true);
    return response.success && response.data['success'] == true;
  }

  Future<bool> deleteNotification(String id) async {
    final response = await _apiService.delete('${AppConstants.notifications}/$id', auth: true);
    return response.success && response.data['success'] == true;
  }
}
