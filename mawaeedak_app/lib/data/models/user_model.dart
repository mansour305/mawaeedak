class User {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final bool isActive;
  final String? roleId;
  final DateTime? createdAt;

  User({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.isActive = true,
    this.roleId,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      isActive: json['is_active'] == 1 || json['is_active'] == true,
      roleId: json['role_id'],
      createdAt: json['created_at'] != null ? DateTime.tryParse(json['created_at']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'is_active': isActive,
      'role_id': roleId,
      'created_at': createdAt?.toIso8601String(),
    };
  }

  static User? fromStoredJson(Map<String, dynamic>? json) {
    if (json == null) return null;
    return User.fromJson(json);
  }
}
