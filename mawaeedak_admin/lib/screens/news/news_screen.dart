import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class NewsAdminScreen extends StatefulWidget {
  const NewsAdminScreen({super.key});
  @override
  State<NewsAdminScreen> createState() => _NewsAdminScreenState();
}

class _NewsAdminScreenState extends State<NewsAdminScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _news = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNews();
  }

  Future<void> _loadNews() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/news', auth: true);
    if (response['success'] == true) {
      setState(() {
        _news = List<Map<String, dynamic>>.from(response['data'] ?? []);
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
              ElevatedButton.icon(onPressed: _addNews, icon: const Icon(Icons.add), label: const Text('إضافة خبر')),
              const SizedBox(width: 16),
              ElevatedButton.icon(onPressed: _loadNews, icon: const Icon(Icons.refresh), label: const Text('تحديث')),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _news.isEmpty
                    ? const Center(child: Text('لا يوجد أخبار'))
                    : Card(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            columns: const [
                              DataColumn(label: Text('العنوان')),
                              DataColumn(label: Text('المحتوى')),
                              DataColumn(label: Text('الحالة')),
                              DataColumn(label: Text('الإجراءات')),
                            ],
                            rows: _news.map((n) => DataRow(
                              cells: [
                                DataCell(Text(n['title'] ?? '')),
                                DataCell(Text(n['content'] ?? '-', maxLines: 2, overflow: TextOverflow.ellipsis)),
                                DataCell(Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: n['is_active'] == 1 ? AppColors.success.withOpacity(0.1) : AppColors.error.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(n['is_active'] == 1 ? 'نشط' : 'غير نشط', style: TextStyle(fontSize: 12, color: n['is_active'] == 1 ? AppColors.success : AppColors.error)),
                                )),
                                DataCell(Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    IconButton(icon: const Icon(Icons.edit, size: 20), onPressed: () {}),
                                    IconButton(icon: const Icon(Icons.delete, size: 20, color: AppColors.error), onPressed: () async {
                                      await _api.delete('/news/${n['id']}', auth: true);
                                      _loadNews();
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

  void _addNews() {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إضافة خبر'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleController, decoration: const InputDecoration(labelText: 'العنوان')),
            const SizedBox(height: 16),
            TextField(controller: contentController, decoration: const InputDecoration(labelText: 'المحتوى'), maxLines: 4),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              await _api.post('/news', body: {'title': titleController.text, 'content': contentController.text}, auth: true);
              Navigator.pop(ctx);
              _loadNews();
            },
            child: const Text('إضافة')),
        ],
      ),
    );
  }
}