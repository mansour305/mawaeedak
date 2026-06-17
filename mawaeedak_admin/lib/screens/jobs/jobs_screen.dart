import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class JobsAdminScreen extends StatefulWidget {
  const JobsAdminScreen({super.key});
  @override
  State<JobsAdminScreen> createState() => _JobsAdminScreenState();
}

class _JobsAdminScreenState extends State<JobsAdminScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _jobs = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/jobs', auth: true);
    if (response['success'] == true) {
      setState(() {
        _jobs = List<Map<String, dynamic>>.from(response['data'] ?? []);
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
          Row(
            children: [
              ElevatedButton.icon(onPressed: _addJob, icon: const Icon(Icons.add), label: const Text('إضافة وظيفة')),
              const SizedBox(width: 16),
              ElevatedButton.icon(onPressed: _loadJobs, icon: const Icon(Icons.refresh), label: const Text('تحديث')),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _jobs.isEmpty
                    ? const Center(child: Text('لا يوجد وظائف'))
                    : Card(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            columns: const [
                              DataColumn(label: Text('المسمى')),
                              DataColumn(label: Text('الشركة')),
                              DataColumn(label: Text('الموقع')),
                              DataColumn(label: Text('الراتب')),
                              DataColumn(label: Text('الإجراءات')),
                            ],
                            rows: _jobs.map((j) => DataRow(
                              cells: [
                                DataCell(Text(j['title'] ?? '')),
                                DataCell(Text(j['company'] ?? '-')),
                                DataCell(Text(j['location'] ?? '-')),
                                DataCell(Text(j['salary_range'] ?? '-')),
                                DataCell(Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () {}),
                                    IconButton(icon: const Icon(Icons.delete, size: 20, color: AppColors.error), onPressed: () async {
                                      await _api.delete('/jobs/${j['id']}', auth: true);
                                      _loadJobs();
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

  void _addJob() {
    final titleController = TextEditingController();
    final companyController = TextEditingController();
    final locationController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إضافة وظيفة'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleController, decoration: const InputDecoration(labelText: 'المسمى الوظيفي')),
            const SizedBox(height: 16),
            TextField(controller: companyController, decoration: const InputDecoration(labelText: 'الشركة')),
            const SizedBox(height: 16),
            TextField(controller: locationController, decoration: const InputDecoration(labelText: 'الموقع')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              await _api.post('/jobs', body: {
                'title': titleController.text,
                'company': companyController.text,
                'location': locationController.text,
              }, auth: true);
              Navigator.pop(ctx);
              _loadJobs();
            },
            child: const Text('إضافة')),
        ],
      ),
    );
  }
}