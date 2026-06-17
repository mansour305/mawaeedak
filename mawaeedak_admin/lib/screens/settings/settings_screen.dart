import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final ApiService _api = ApiService();
  Map<String, dynamic> _settings = {};
  bool _isLoading = true;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() => _isLoading = true);
    final response = await _api.get('/settings', auth: true);
    if (response['success'] == true) {
      setState(() {
        _settings = response['data'] ?? {};
        _isLoading = false;
      });
    }
    setState(() => _isLoading = false);
  }

  Future<void> _saveSettings() async {
    await _api.put('/settings', body: _settings, auth: true);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم حفظ الإعدادات'), backgroundColor: AppColors.success),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('إعدادات عامة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 16),
                            TextFormField(
                              initialValue: _settings['app_name'] ?? 'مواعيدك',
                              decoration: const InputDecoration(labelText: 'اسم التطبيق'),
                              onChanged: (v) => _settings['app_name'] = v,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              initialValue: _settings['contact_email'] ?? '',
                              decoration: const InputDecoration(labelText: 'البريد الإلكتروني'),
                              onChanged: (v) => _settings['contact_email'] = v,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              initialValue: _settings['contact_phone'] ?? '',
                              decoration: const InputDecoration(labelText: 'رقم الهاتف'),
                              onChanged: (v) => _settings['contact_phone'] = v,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('روابط التواصل', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 16),
                            TextFormField(
                              initialValue: _settings['privacy_policy_url'] ?? '',
                              decoration: const InputDecoration(labelText: 'سياسة الخصوصية'),
                              onChanged: (v) => _settings['privacy_policy_url'] = v,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              initialValue: _settings['terms_url'] ?? '',
                              decoration: const InputDecoration(labelText: 'الشروط والأحكام'),
                              onChanged: (v) => _settings['terms_url'] = v,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(onPressed: _saveSettings, icon: const Icon(Icons.save), label: const Text('حفظ الإعدادات')),
                  ],
                ),
              ),
            ),
    );
  }
}