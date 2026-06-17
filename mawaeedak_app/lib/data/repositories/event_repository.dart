import '../../core/constants/app_constants.dart';
import '../../core/utils/api_service.dart';
import '../models/event_model.dart';

class EventRepository {
  final ApiService _apiService = ApiService();

  Future<List<CalendarEvent>> getEvents({String? date, String? startDate, String? endDate, String? category}) async {
    final queryParams = <String, String>{};
    if (date != null) queryParams['date'] = date;
    if (startDate != null) queryParams['start_date'] = startDate;
    if (endDate != null) queryParams['end_date'] = endDate;
    if (category != null) queryParams['category'] = category;
    
    final response = await _apiService.get(
      AppConstants.calendar,
      queryParams: queryParams.isNotEmpty ? queryParams : null,
    );
    
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => CalendarEvent.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<CalendarEvent>> getEventsByView(String viewType) async {
    final response = await _apiService.get('${AppConstants.calendar}/view/$viewType');
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => CalendarEvent.fromJson(e)).toList();
    }
    return [];
  }

  Future<CalendarEvent?> createEvent(CalendarEvent event) async {
    final response = await _apiService.post(
      AppConstants.calendar,
      body: event.toJson(),
      auth: true,
    );
    if (response.success && response.data['success'] == true) {
      return CalendarEvent.fromJson(response.data['data']);
    }
    return null;
  }

  Future<CalendarEvent?> updateEvent(CalendarEvent event) async {
    final response = await _apiService.put(
      '${AppConstants.calendar}/${event.id}',
      body: event.toJson(),
      auth: true,
    );
    if (response.success && response.data['success'] == true) {
      return CalendarEvent.fromJson(response.data['data']);
    }
    return null;
  }

  Future<bool> deleteEvent(String id) async {
    final response = await _apiService.delete('${AppConstants.calendar}/$id', auth: true);
    return response.success && response.data['success'] == true;
  }

  Future<List<Service>> getServices() async {
    final response = await _apiService.get(AppConstants.services);
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => Service.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<Trip>> getTrips() async {
    final response = await _apiService.get(AppConstants.trips, auth: true);
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => Trip.fromJson(e)).toList();
    }
    return [];
  }

  Future<Trip?> createTrip(Trip trip) async {
    final response = await _apiService.post(AppConstants.trips, body: trip.toJson(), auth: true);
    if (response.success && response.data['success'] == true) {
      return Trip.fromJson(response.data['data']);
    }
    return null;
  }

  Future<Trip?> updateTrip(Trip trip) async {
    final response = await _apiService.put('${AppConstants.trips}/${trip.id}', body: trip.toJson(), auth: true);
    if (response.success && response.data['success'] == true) {
      return Trip.fromJson(response.data['data']);
    }
    return null;
  }

  Future<bool> deleteTrip(String id) async {
    final response = await _apiService.delete('${AppConstants.trips}/$id', auth: true);
    return response.success && response.data['success'] == true;
  }

  Future<List<News>> getNews({int? limit}) async {
    final queryParams = <String, String>{};
    if (limit != null) queryParams['limit'] = limit.toString();
    
    final response = await _apiService.get(
      AppConstants.news,
      queryParams: queryParams.isNotEmpty ? queryParams : null,
    );
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => News.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<Job>> getJobs() async {
    final response = await _apiService.get(AppConstants.jobs);
    if (response.success && response.data['success'] == true) {
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => Job.fromJson(e)).toList();
    }
    return [];
  }
}
