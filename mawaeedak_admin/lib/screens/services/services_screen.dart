import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class ServicesAdminScreen extends StatefulWidget {
  const ServicesAdminScreen({super.key});
  @override
  State<ServicesAdminScreen> createState() => _ServicesAdminScreenState();
}

class _ServicesAdminScreenState extends State<ServicesAdminScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _services = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/services', auth: true);
    if (response['success'] == true) {
      setState(() {
        _services = List<Map<String, dynamic>>.from(response['data'] ?? []);
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
          ElevatedButton.icon(onPressed: _loadServices, icon: const Icon(Icons.refresh), label: const Text('تحديث')),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _services.isEmpty
                    ? const Center(child: Text('لا يوجد خدمات'))
                    : Card(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            columns: const [
                              DataColumn(label: Text('العنوان')),
                              DataColumn(label: Text('الوصف')),
                              DataColumn(label: Text('النوع')),
                              DataColumn(label: Text('الحالة')),
                            ],
                            rows: _services.map((s) => DataRow(
                              cells: [
                                DataCell(Text(s['title'] ?? '')),
                                DataCell(Text(s['description'] ?? '-')),
                                DataCell(Text(s['type'] ?? '')),
                                DataCell(Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: s['is_active'] == 1 ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(s['is_active'] == 1 ? 'نشط' : 'غير نشط', style: TextStyle(fontSize: 12, color: s['is_active'] == 1 ? AppColors.success : AppColors.error)),
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