import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class SupportsScreen extends StatefulWidget {
  const SupportsScreen({super.key});
  @override
  State<SupportsScreen> createState() => _SupportsScreenState();
}

class _SupportsScreenState extends State<SupportsScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _supports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSupports();
  }

  Future<void> _loadSupports() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/supports', auth: true);
    if (response['success'] == true) {
      setState(() {
        _supports = List<Map<String, dynamic>>.from(response['data'] ?? []);
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
          ElevatedButton.icon(onPressed: _loadSupports, icon: const Icon(Icons.refresh), label: const Text('تحديث')),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _supports.isEmpty
                    ? const Center(child: Text('لا يوجد دعوم'))
                    : Card(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            columns: const [
                              DataColumn(label: Text('العنوان')),
                              DataColumn(label: Text('المبلغ')),
                              DataColumn(label: Text('النوع')),
                              DataColumn(label: Text('التاريخ')),
                              DataColumn(label: Text('الإجراءات')),
                            ],
                            rows: _supports.map((s) => DataRow(
                              cells: [
                                DataCell(Text(s['title'] ?? '')),
                                DataCell(Text('${s['amount'] ?? '-'}')),
                                DataCell(Text(s['type'] ?? '')),
                                DataCell(Text(s['payment_date'] ?? '')),
                                DataCell(Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () {}),
                                    IconButton(icon: const Icon(Icons.delete, size: 20, color: AppColors.error), onPressed: () async {
                                      await _api.delete('/supports/${s['id']}', auth: true);
                                      _loadSupports();
                                    }),
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