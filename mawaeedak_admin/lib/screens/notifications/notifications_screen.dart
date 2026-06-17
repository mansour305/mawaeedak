import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class NotificationsAdminScreen extends StatefulWidget {
  const NotificationsAdminScreen({super.key});
  @override
  State<NotificationsAdminScreen> createState() => _NotificationsAdminScreenState();
}

class _NotificationsAdminScreenState extends State<NotificationsAdminScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/notifications', auth: true);
    if (response['success'] == true) {
      setState(() {
        _notifications = List<Map<String, dynamic>>.from(response['data'] ?? []);
        _isLoading = false;
      });
    }
    setState(() => _isLoading = false);
  }

  void _sendNotification() {
    final titleController = TextEditingController();
    final bodyController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إرسال إشعار'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleController, decoration: const InputDecoration(labelText: 'العنوان')),
            const SizedBox(height: 16),
            TextField(controller: bodyController, decoration: const InputDecoration(labelText: 'المحتوى'), maxLines: 3),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          ElevatedButton(
            onPressed: () async {
              await _api.post('/notifications', body: {
                'title': titleController.text,
                'body': bodyController.text,
                'target_type': 'all',
              }, auth: true);
              Navigator.pop(ctx);
              _loadNotifications();
            },
            child: const Text('إرسال'),
          ),
        ],
      ),
    );
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
              ElevatedButton.icon(onPressed: _sendNotification, icon: const Icon(Icons.send), label: const Text('إرسال إشعار')),
              const SizedBox(width: 16),
              ElevatedButton.icon(onPressed: _loadNotifications, icon: const Icon(Icons.refresh), label: const Text('تحديث')),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _notifications.isEmpty
                    ? const Center(child: Text('لا يوجد إشعارات'))
                    : Card(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            columns: const [
                              DataColumn(label: Text('العنوان')),
                              DataColumn(label: Text('المحتوى')),
                              DataColumn(label: Text('الفئة')),
                              DataColumn(label: Text('التاريخ')),
                            ],
                            rows: _notifications.map((n) => DataRow(
                              cells: [
                                DataCell(Text(n['title'] ?? '')),
                                DataCell(Text(n['body'] ?? '-')),
                                DataCell(Text(n['target_type'] ?? '')),
                                DataCell(Text(n['created_at']?.toString().split(' ').first ?? '')),
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