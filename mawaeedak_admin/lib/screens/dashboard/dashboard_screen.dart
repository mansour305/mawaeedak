import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/api_service.dart';
import '../auth/login_screen.dart';
import '../users/users_screen.dart';
import '../salaries/salaries_screen.dart';
import '../supports/supports_screen.dart';
import '../calendar/calendar_screen.dart';
import '../services/services_screen.dart';
import '../notifications/notifications_screen.dart';
import '../news/news_screen.dart';
import '../jobs/jobs_screen.dart';
import '../settings/settings_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiService _api = ApiService();
  int _selectedIndex = 0;
  Map<String, dynamic> _stats = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    final response = await _api.get('/dashboard/stats', auth: true);
    if (response['success'] == true) {
      setState(() {
        _stats = response['data'] ?? {};
        _isLoading = false;
      });
    } else {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          _buildSidebar(),
          Expanded(child: _buildContent()),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 250,
      color: AppColors.primaryDark,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 50, height: 50,
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.calendar_month_rounded, color: AppColors.primaryDark),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('مواعيدك', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                      Text('لوحة التحكم', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white24),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(12),
              children: [
                _buildNavItem(0, Icons.dashboard_rounded, 'لوحة التحكم', () => setState(() => _selectedIndex = 0)),
                _buildNavItem(1, Icons.people_rounded, 'المستخدمين', () => setState(() => _selectedIndex = 1)),
                _buildNavItem(2, Icons.account_balance_wallet_rounded, 'الرواتب', () => setState(() => _selectedIndex = 2)),
                _buildNavItem(3, Icons.volunteer_activism_rounded, 'الدعوم', () => setState(() => _selectedIndex = 3)),
                _buildNavItem(4, Icons.calendar_month_rounded, 'التقويم', () => setState(() => _selectedIndex = 4)),
                _buildNavItem(5, Icons.apps_rounded, 'الخدمات', () => setState(() => _selectedIndex = 5)),
                _buildNavItem(6, Icons.notifications_rounded, 'الإشعارات', () => setState(() => _selectedIndex = 6)),
                _buildNavItem(7, Icons.newspaper_rounded, 'الأخبار', () => setState(() => _selectedIndex = 7)),
                _buildNavItem(8, Icons.work_rounded, 'الوظائف', () => setState(() => _selectedIndex = 8)),
                _buildNavItem(9, Icons.settings_rounded, 'الإعدادات', () => setState(() => _selectedIndex = 9)),
              ],
            ),
          ),
          const Divider(color: Colors.white24),
          Padding(
            padding: const EdgeInsets.all(12),
            child: ListTile(
              leading: const Icon(Icons.logout_rounded, color: Colors.white),
              title: const Text('تسجيل الخروج', style: TextStyle(color: Colors.white)),
              onTap: () async {
                await _api.clearToken();
                if (mounted) {
                  Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String title, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: _selectedIndex == index ? Colors.white.withOpacity(0.2) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(icon, color: Colors.white),
        title: Text(title, style: const TextStyle(color: Colors.white)),
        onTap: onTap,
        selected: _selectedIndex == index,
        selectedTileColor: Colors.white.withOpacity(0.1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildContent() {
    return Column(
      children: [
        _buildTopBar(),
        Expanded(child: _buildScreen()),
      ],
    );
  }

  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)]),
      child: Row(
        children: [
          Text(_getScreenTitle(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const Spacer(),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadStats),
          const SizedBox(width: 8),
          IconButton(icon: const Icon(Icons.notifications_rounded), onPressed: () {}),
        ],
      ),
    );
  }

  String _getScreenTitle() {
    switch (_selectedIndex) {
      case 0: return 'لوحة التحكم';
      case 1: return 'إدارة المستخدمين';
      case 2: return 'إدارة الرواتب';
      case 3: return 'إدارة الدعوم';
      case 4: return 'إدارة التقويم';
      case 5: return 'إدارة الخدمات';
      case 6: return 'إدارة الإشعارات';
      case 7: return 'إدارة الأخبار';
      case 8: return 'إدارة الوظائف';
      case 9: return 'الإعدادات';
      default: return 'مواعيدك';
    }
  }

  Widget _buildScreen() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    
    switch (_selectedIndex) {
      case 0: return _buildDashboard();
      case 1: return const UsersScreen();
      case 2: return const SalariesScreen();
      case 3: return const SupportsScreen();
      case 4: return const CalendarAdminScreen();
      case 5: return const ServicesAdminScreen();
      case 6: return const NotificationsAdminScreen();
      case 7: return const NewsAdminScreen();
      case 8: return const JobsAdminScreen();
      case 9: return const SettingsScreen();
      default: return _buildDashboard();
    }
  }

  Widget _buildDashboard() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStatsRow(),
          const SizedBox(height: 24),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _buildQuickActions()),
              const SizedBox(width: 24),
              Expanded(child: _buildRecentActivity()),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        Expanded(child: _buildStatCard('المستخدمين', '${_stats['users']?['total'] ?? 0}', Icons.people_rounded, AppColors.primary)),
        const SizedBox(width: 16),
        Expanded(child: _buildStatCard('الرواتب', '${_stats['salaries']?['total'] ?? 0}', Icons.account_balance_wallet_rounded, AppColors.success)),
        const SizedBox(width: 16),
        Expanded(child: _buildStatCard('الدعوم', '${_stats['supports']?['total'] ?? 0}', Icons.volunteer_activism_rounded, AppColors.info)),
        const SizedBox(width: 16),
        Expanded(child: _buildStatCard('الأخبار', '${_stats['news']?['total'] ?? 0}', Icons.newspaper_rounded, AppColors.warning)),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
      child: Row(
        children: [
          Container(
            width: 50, height: 50,
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              Text(title, style: TextStyle(color: AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('إجراءات سريعة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _buildActionChip('إضافة مستخدم', Icons.person_add_rounded, () {}),
              _buildActionChip('إضافة راتب', Icons.add_card_rounded, () {}),
              _buildActionChip('إرسال إشعار', Icons.notifications_active_rounded, () {}),
              _buildActionChip('إضافة خبر', Icons.article_rounded, () {}),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionChip(String label, IconData icon, VoidCallback onTap) {
    return ActionChip(
      avatar: Icon(icon, size: 18),
      label: Text(label),
      onPressed: onTap,
    );
  }

  Widget _buildRecentActivity() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('النشاط الأخير', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildActivityItem('تم إضافة راتب جديد', 'منذ ساعة'),
          _buildActivityItem('تم تسجيل مستخدم جديد', 'منذ 3 ساعات'),
          _buildActivityItem('تم تحديث الأخبار', 'منذ يوم'),
        ],
      ),
    );
  }

  Widget _buildActivityItem(String title, String time) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
          const SizedBox(width: 12),
          Expanded(child: Text(title)),
          Text(time, style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
        ],
      ),
    );
  }
}
