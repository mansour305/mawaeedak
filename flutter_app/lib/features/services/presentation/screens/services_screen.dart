import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';

class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.paper,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFFAF7F2), Color(0xFFF3E8D6)],
          ),
        ),
        child: SafeArea(
          bottom: false,
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                // Header
                Row(
                  children: [
                    Container(
                      width: 56, height: 56,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.82),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.borderGold),
                        boxShadow: [BoxShadow(color: AppColors.brown.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, 4))],
                      ),
                      child: Icon(Icons.grid_view_rounded, color: AppColors.gold, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('خدماتك', style: GoogleFonts.cairo(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.ink, height: 1.3)),
                          const SizedBox(height: 4),
                          Text('اختر الخدمة التي تحتاجها', style: GoogleFonts.cairo(fontSize: 14, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Services Grid
                _buildServicesGrid(context),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildServicesGrid(BuildContext context) {
    final services = [
      {'icon': Icons.track_changes, 'name': 'احسب هدفك', 'description': 'حدد أهدافك واحسب تقدمك', 'route': 'goal-calculator', 'color': AppColors.gold},
      {'icon': Icons.calculate_outlined, 'name': 'حساب التكاليف', 'description': 'تتبع مشاريعك وتكاليفك', 'route': 'cost-calculator', 'color': AppColors.mistBlue},
      {'icon': Icons.notifications_active_outlined, 'name': 'ذكرني', 'description': 'تذكيرات ذكية لمواعيدك', 'route': 'reminder', 'color': AppColors.success},
      {'icon': Icons.flight_takeoff_outlined, 'name': 'السفر', 'description': 'رحلاتك وتأشيراتك', 'route': 'travel', 'color': AppColors.info},
      {'icon': Icons.school_outlined, 'name': 'الدراسة والإجازات', 'description': 'اختبارات وإجازات دراسية', 'route': 'study', 'color': const Color(0xFF9B59B6)},
      {'icon': Icons.work_outline, 'name': 'الوظائف والأخبار', 'description': 'وظائف وأخبار جديدة', 'route': 'jobs', 'color': const Color(0xFFE67E22)},
      {'icon': Icons.card_giftcard_outlined, 'name': 'بطاقة اليوم', 'description': 'شارك يومك مع الآخرين', 'route': 'daily-card', 'color': AppColors.brown},
      {'icon': Icons.feedback_outlined, 'name': 'صوتك مسموع', 'description': 'شاركنا رأيك واقتراحاتك', 'route': 'feedback', 'color': const Color(0xFF1ABC9C)},
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.82),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderGold),
        boxShadow: [BoxShadow(color: AppColors.brown.withOpacity(0.10), blurRadius: 30, offset: const Offset(0, 12))],
      ),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 14,
          mainAxisSpacing: 14,
          childAspectRatio: 0.88,
        ),
        itemCount: services.length,
        itemBuilder: (context, index) {
          final service = services[index];
          return _ServiceCard(
            icon: service['icon'] as IconData,
            name: service['name'] as String,
            description: service['description'] as String,
            color: service['color'] as Color,
            onTap: () => _navigateToService(context, service['route'] as String),
          );
        },
      ),
    );
  }

  void _navigateToService(BuildContext context, String route) {
    switch (route) {
      case 'goal-calculator': context.push('/goal-calculator'); break;
      case 'cost-calculator': context.push('/cost-calculator'); break;
      case 'reminder': context.push('/reminder'); break;
      case 'travel': context.push('/travel'); break;
      case 'study': context.push('/study'); break;
      case 'jobs': context.push('/jobs'); break;
      case 'daily-card': context.pushNamed('daily-card'); break;
      case 'feedback': context.push('/feedback'); break;
    }
  }
}

class _ServiceCard extends StatelessWidget {
  final IconData icon;
  final String name;
  final String description;
  final Color color;
  final VoidCallback onTap;

  const _ServiceCard({required this.icon, required this.name, required this.description, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.2)),
          boxShadow: [BoxShadow(color: AppColors.brown.withOpacity(0.06), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 64, height: 64,
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [color.withOpacity(0.2), color.withOpacity(0.1)]),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Center(child: Icon(icon, color: color, size: 32)),
            ),
            const SizedBox(height: 12),
            Text(name, style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.ink), textAlign: TextAlign.center),
            const SizedBox(height: 6),
            Text(description, style: GoogleFonts.cairo(fontSize: 12, color: AppColors.textSecondary), textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
    );
  }
}