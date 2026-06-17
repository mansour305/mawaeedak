import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class SalariesScreen extends StatefulWidget {
  const SalariesScreen({super.key});
  @override
  State<SalariesScreen> createState() => _SalariesScreenState();
}

class _SalariesScreenState extends State<SalariesScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _salaries = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSalaries();
  }

  Future<void> _loadSalaries() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/salaries', auth: true);
    if (response['success'] == true) {
      setState(() {
        _salaries = List<Map<String, dynamic>>.from(response['data'] ?? []);
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
          ElevatedButton.icon(onPressed: _addSalary, icon: const Icon(Icons.add), label: const Text('إضافة راتب')),
          const SizedBox(width: 16),
          ElevatedButton.icon(onPressed: _loadSalaries, icon: const Icon(Icons.refresh), label: const Text('تحديث')),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _salaries.isEmpty
                    ? const Center(child: Text('لا يوجد رواتب'))
                    : Card(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            columns: const [
                              DataColumn(label: Text('العنوان')),
                              DataColumn(label: Text('المبلغ')),
                              DataColumn(label: Text('التاريخ')),
                              DataColumn(label: Text('الإجراءات')),
                            ],
                            rows: _salaries.map((s) => DataRow(
                              cells: [
                                DataCell(Text(s['title'] ?? '')),
                                DataCell(Text('${s['amount'] ?? '-'}')),
                                DataCell(Text(s['payment_date'] ?? '')),
                                DataCell(Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () {}),
                                    IconButton(icon: const Icon(Icons.delete, size: 20, color: AppColors.error), onPressed: () async {
                                      await _api.delete('/salaries/${s['id']}', auth: true);
                                      _loadSalaries();
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

  void _addSalary() {
    final titleController = TextEditingController();
    final amountController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إضافة راتب'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleController, decoration: const InputDecoration(labelText: 'العنوان')),
            const SizedBox(height: 16),
            TextField(controller: amountController, decoration: const InputDecoration(labelText: 'المبلغ'), keyboardType: TextInputType.number),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              await _api.post('/salaries', body: {
                'title': titleController.text,
                'amount': double.tryParse(amountController.text),
                'payment_date': DateTime.now().add(const Duration(days: 30)).toIso8601String().split('T')[0],
                'type': 'salary',
              }, auth: true);
              Navigator.pop(ctx);
              _loadSalaries();
            },
            child: const Text('إضافة'),
          ),
        ],
      ),
    );
  }
}