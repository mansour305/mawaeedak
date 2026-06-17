import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});
  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/users', auth: true);
    if (response['success'] == true) {
      setState(() {
        _users = List<Map<String, dynamic>>.from(response['data'] ?? []);
        _isLoading = false;
      });
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ElevatedButton.icon(onPressed: _loadUsers, icon: const Icon(Icons.refresh), label: const Text('تحديث')),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _users.isEmpty
                    ? const Center(child: Text('لا يوجد مستخدمين'))
                    : Card(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            columns: const [
                              DataColumn(label: Text('الاسم')),
                              DataColumn(label: Text('الهاتف')),
                              DataColumn(label: Text('البريد')),
                              DataColumn(label: Text('الحالة')),
                              DataColumn(label: Text('الإجراءات')),
                            ],
                            rows: _users.map((user) => DataRow(
                              cells: [
                                DataCell(Text(user['name'] ?? '')),
                                DataCell(Text(user['phone'] ?? '')),
                                DataCell(Text(user['email'] ?? '-')),
                                DataCell(
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: user['is_active'] == 1 ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(user['is_active'] == 1 ? 'نشط' : 'غير نشط', style: TextStyle(color: user['is_active'] == 1 ? AppColors.success : AppColors.error, fontSize: 12)),
                                  ),
                                ),
                                DataCell(Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () {}),
                                    IconButton(icon: const Icon(Icons.delete, size: 20, color: AppColors.error), onPressed: () {}),
                                  ],
                                )),
                              ],
                            )).toList(),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}