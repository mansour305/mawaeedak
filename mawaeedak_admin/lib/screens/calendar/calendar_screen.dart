import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class CalendarAdminScreen extends StatefulWidget {
  const CalendarAdminScreen({super.key});
  @override
  State<CalendarAdminScreen> createState() => _CalendarAdminScreenState();
}

class _CalendarAdminScreenState extends State<CalendarAdminScreen> {
  final ApiService _api = ApiService();
  List<Map<String, dynamic>> _events = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/calendar', auth: true);
    if (response['success'] == true) {
      setState(() {
        _events = List<Map<String, dynamic>>.from(response['data'] ?? []);
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
          ElevatedButton.icon(onPressed: _loadEvents, icon: const Icon(Icons.refresh), label: const Text('تحديث')),
          const SizedBox(height: 16),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _events.isEmpty
                    ? const Center(child: Text('لا يوجد أحداث'))
                    : Card(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: DataTable(
                            columns: const [
                              DataColumn(label: Text('العنوان')),
                              DataColumn(label: Text('التاريخ')),
                              DataColumn(label: Text('الوقت')),
                              DataColumn(label: Text('الفئة')),
                            ],
                            rows: _events.map((e) => DataRow(
                              cells: [
                                DataCell(Text(e['title'] ?? '')),
                                DataCell(Text(e['event_date'] ?? '')),
                                DataCell(Text(e['event_time'] ?? '-')),
                                DataCell(Text(e['category'] ?? '')),
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