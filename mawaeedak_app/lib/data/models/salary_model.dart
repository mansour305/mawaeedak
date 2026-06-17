class Salary {
  final String id;
  final String title;
  final double? amount;
  final DateTime paymentDate;
  final String type;
  final String? description;
  final bool isActive;
  final DateTime? createdAt;

  Salary({
    required this.id,
    required this.title,
    this.amount,
    required this.paymentDate,
    this.type = 'salary',
    this.description,
    this.isActive = true,
    this.createdAt,
  });

  factory Salary.fromJson(Map<String, dynamic> json) {
    return Salary(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      amount: json['amount']?.toDouble(),
      paymentDate: DateTime.parse(json['payment_date']),
      type: json['type'] ?? 'salary',
      description: json['description'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'amount': amount,
      'payment_date': paymentDate.toIso8601String(),
      'type': type,
      'description': description,
      'is_active': isActive,
    };
  }

  bool get isUpcoming {
    return paymentDate.isAfter(DateTime.now());
  }

  int get daysRemaining {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final payment = DateTime(paymentDate.year, paymentDate.month, paymentDate.day);
    return payment.difference(today).inDays;
  }
}

class Support {
  final String id;
  final String title;
  final double? amount;
  final DateTime paymentDate;
  final String type;
  final String? description;
  final bool isActive;
  final DateTime? createdAt;

  Support({
    required this.id,
    required this.title,
    this.amount,
    required this.paymentDate,
    required this.type,
    this.description,
    this.isActive = true,
    this.createdAt,
  });

  factory Support.fromJson(Map<String, dynamic> json) {
    return Support(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      amount: json['amount']?.toDouble(),
      paymentDate: DateTime.parse(json['payment_date']),
      type: json['type'] ?? 'other',
      description: json['description'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'amount': amount,
      'payment_date': paymentDate.toIso8601String(),
      'type': type,
      'description': description,
      'is_active': isActive,
    };
  }

  bool get isUpcoming {
    return paymentDate.isAfter(DateTime.now());
  }

  int get daysRemaining {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final payment = DateTime(paymentDate.year, paymentDate.month, paymentDate.day);
    return payment.difference(today).inDays;
  }

  String get typeName {
    switch (type) {
      case 'housing':
        return 'دعم سكني';
      case 'utility':
        return 'دعم مرافق';
      case 'citizen_account':
        return 'حساب المواطن';
      case 'education':
        return 'دعم تعليمي';
      case 'health':
        return 'دعم صحي';
      default:
        return 'دعم آخر';
    }
  }
}
