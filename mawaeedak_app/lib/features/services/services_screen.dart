import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/event_model.dart';
import '../../data/repositories/event_repository.dart';
import 'trips_screen.dart';
import 'news_screen.dart';
import 'jobs_screen.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  final EventRepository _repository = EventRepository();
  List<Service> _services = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  Future<void> _loadServices() async {
    setState(() => _isLoading = true);
    _services = await _repository.getServices();
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الخدمات'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadServices,
              child: GridView.builder(
                padding: const EdgeInsets.all(16),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.9,
                ),
                itemCount: _getDefaultServices().length,
                itemBuilder: (context, index) {
                  final service = _getDefaultServices()[index];
                  return _buildServiceCard(service);
                },
              ),
            ),
    );
  }

  Widget _buildServiceCard(Service service) {
    return GestureDetector(
      onTap: () => _handleServiceTap(service),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: _getServiceColor(service.type).withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(
                _getServiceIcon(service.type),
                size: 36,
                color: _getServiceColor(service.type),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              service.title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 4),
            Text(
              service.description ?? '',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  List<Service> _getDefaultServices() {
    if (_services.isNotEmpty) return _services;
    return [
      Service(id: '1', title: 'أضف موعداً بنفسك', description: 'إنشاء موعد جديد', type: 'add_appointment', icon: 'add_calendar'),
      Service(id: '2', title: 'رحلاتي', description: 'إدارة رحلاتي', type: 'trips', icon: 'flight'),
      Service(id: '3', title: 'اتصل بنا', description: 'تواصل معنا', type: 'contact', icon: 'phone'),
      Service(id: '4', title: 'الأخبار', description: 'آخر الأخبار', type: 'news', icon: 'news'),
      Service(id: '5', title: 'الوظائف', description: 'فرص عمل', type: 'jobs', icon: 'work'),
    ];
  }

  void _handleServiceTap(Service service) {
    switch (service.type) {
      case 'trips':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const TripsScreen()));
        break;
      case 'news':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const NewsScreen()));
        break;
      case 'jobs':
        Navigator.push(context, MaterialPageRoute(builder: (_) => const JobsScreen()));
        break;
      case 'contact':
        _showContactDialog();
        break;
      case 'add_appointment':
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('استخدم التقويم لإضافة موعد جديد')),
        );
        break;
    }
  }

  void _showContactDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('اتصل بنا'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.phone, color: AppColors.primary),
              title: Text('920000000'),
              subtitle: Text('الخط الساخن'),
            ),
            ListTile(
              leading: Icon(Icons.email, color: AppColors.primary),
              title: Text('info@mawaeedak.com'),
              subtitle: Text('البريد الإلكتروني'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق'),
          ),
        ],
      ),
    );
  }

  IconData _getServiceIcon(String type) {
    switch (type) {
      case 'add_appointment':
        return Icons.add_circle_outline_rounded;
      case 'trips':
        return Icons.flight_rounded;
      case 'contact':
        return Icons.phone_rounded;
      case 'news':
        return Icons.newspaper_rounded;
      case 'jobs':
        return Icons.work_rounded;
      default:
        return Icons.apps_rounded;
    }
  }

  Color _getServiceColor(String type) {
    switch (type) {
      case 'add_appointment':
        return AppColors.primary;
      case 'trips':
        return AppColors.success;
      case 'contact':
        return AppColors.info;
      case 'news':
        return AppColors.accent;
      case 'jobs':
        return AppColors.primaryDark;
      default:
        return AppColors.primary;
    }
  }
}
