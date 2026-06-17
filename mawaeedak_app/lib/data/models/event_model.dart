class CalendarEvent {
  final String id;
  final String title;
  final String? description;
  final DateTime eventDate;
  final String? eventTime;
  final String category;
  final String? userId;
  final bool isPublic;
  final DateTime? createdAt;

  CalendarEvent({
    required this.id,
    required this.title,
    this.description,
    required this.eventDate,
    this.eventTime,
    this.category = 'general',
    this.userId,
    this.isPublic = true,
    this.createdAt,
  });

  factory CalendarEvent.fromJson(Map<String, dynamic> json) {
    return CalendarEvent(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      eventDate: DateTime.parse(json['event_date']),
      eventTime: json['event_time'],
      category: json['category'] ?? 'general',
      userId: json['user_id'],
      isPublic: json['is_public'] == 1 || json['is_public'] == true,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'event_date': eventDate.toIso8601String().split('T')[0],
      'event_time': eventTime,
      'category': category,
      'is_public': isPublic ? 1 : 0,
    };
  }

  String get categoryName {
    switch (category) {
      case 'banking':
        return 'بنكي';
      case 'health':
        return 'صحي';
      case 'government':
        return 'حكومي';
      case 'education':
        return 'تعليمي';
      case 'work':
        return 'عمل';
      default:
        return 'عام';
    }
  }
}

class Service {
  final String id;
  final String title;
  final String? description;
  final String? icon;
  final String type;
  final String? link;
  final bool isActive;
  final int orderIndex;

  Service({
    required this.id,
    required this.title,
    this.description,
    this.icon,
    required this.type,
    this.link,
    this.isActive = true,
    this.orderIndex = 0,
  });

  factory Service.fromJson(Map<String, dynamic> json) {
    return Service(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      icon: json['icon'],
      type: json['type'] ?? 'other',
      link: json['link'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      orderIndex: json['order_index'] ?? 0,
    );
  }
}

class Trip {
  final String id;
  final String title;
  final String? destination;
  final DateTime? departureDate;
  final DateTime? returnDate;
  final String status;
  final String? userId;
  final String? notes;
  final List<TripChecklistItem> checklist;
  final bool isActive;
  final DateTime? createdAt;

  Trip({
    required this.id,
    required this.title,
    this.destination,
    this.departureDate,
    this.returnDate,
    this.status = 'planned',
    this.userId,
    this.notes,
    this.checklist = const [],
    this.isActive = true,
    this.createdAt,
  });

  factory Trip.fromJson(Map<String, dynamic> json) {
    List<TripChecklistItem> items = [];
    if (json['checklist'] != null) {
      if (json['checklist'] is List) {
        items = (json['checklist'] as List)
            .map((e) => TripChecklistItem.fromJson(e))
            .toList();
      }
    }
    return Trip(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      destination: json['destination'],
      departureDate: json['departure_date'] != null ? DateTime.tryParse(json['departure_date']) : null,
      returnDate: json['return_date'] != null ? DateTime.tryParse(json['return_date']) : null,
      status: json['status'] ?? 'planned',
      userId: json['user_id'],
      notes: json['notes'],
      checklist: items,
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'destination': destination,
      'departure_date': departureDate?.toIso8601String().split('T')[0],
      'return_date': returnDate?.toIso8601String().split('T')[0],
      'status': status,
      'notes': notes,
      'checklist': checklist.map((e) => e.toJson()).toList(),
    };
  }

  String get statusName {
    switch (status) {
      case 'planned':
        return 'مخطط';
      case 'preparing':
        return 'قيد التجهيز';
      case 'ongoing':
        return 'جاري';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }
}

class TripChecklistItem {
  final String id;
  final String title;
  final bool isChecked;

  TripChecklistItem({
    required this.id,
    required this.title,
    this.isChecked = false,
  });

  factory TripChecklistItem.fromJson(Map<String, dynamic> json) {
    return TripChecklistItem(
      id: json['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
      title: json['title'] ?? '',
      isChecked: json['is_checked'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'is_checked': isChecked,
    };
  }
}

class AppNotification {
  final String id;
  final String title;
  final String? body;
  final String type;
  final String targetType;
  final String? targetId;
  final String? userId;
  final bool isRead;
  final DateTime? createdAt;

  AppNotification({
    required this.id,
    required this.title,
    this.body,
    this.type = 'general',
    this.targetType = 'all',
    this.targetId,
    this.userId,
    this.isRead = false,
    this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      body: json['body'],
      type: json['type'] ?? 'general',
      targetType: json['target_type'] ?? 'all',
      targetId: json['target_id'],
      userId: json['user_id'],
      isRead: json['is_read'] == 1 || json['is_read'] == true,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }

  String get typeName {
    switch (type) {
      case 'salary':
        return 'راتب';
      case 'support':
        return 'دعم';
      case 'trip':
        return 'رحلة';
      case 'news':
        return 'أخبار';
      case 'job':
        return 'وظيفة';
      default:
        return 'عام';
    }
  }
}

class News {
  final String id;
  final String title;
  final String? content;
  final String? imageUrl;
  final bool isActive;
  final DateTime? createdAt;

  News({
    required this.id,
    required this.title,
    this.content,
    this.imageUrl,
    this.isActive = true,
    this.createdAt,
  });

  factory News.fromJson(Map<String, dynamic> json) {
    return News(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'],
      imageUrl: json['image_url'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }
}

class Job {
  final String id;
  final String title;
  final String? company;
  final String? location;
  final String? description;
  final String? requirements;
  final String? salaryRange;
  final bool isActive;
  final DateTime? createdAt;

  Job({
    required this.id,
    required this.title,
    this.company,
    this.location,
    this.description,
    this.requirements,
    this.salaryRange,
    this.isActive = true,
    this.createdAt,
  });

  factory Job.fromJson(Map<String, dynamic> json) {
    return Job(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      company: json['company'],
      location: json['location'],
      description: json['description'],
      requirements: json['requirements'],
      salaryRange: json['salary_range'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }
}
