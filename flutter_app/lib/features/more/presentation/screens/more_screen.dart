import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_theme.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

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
                _buildWelcomeCard(context),
                const SizedBox(height: 20),
                _buildDailyCardRow(context),
                const SizedBox(height: 20),
                _buildMenuSection(context),
                const SizedBox(height: 20),
                _buildFooter(),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: AppColors.borderGold),
        boxShadow: [BoxShadow(color: AppColors.brown.withOpacity(0.12), blurRadius: 40, offset: const Offset(0, 16))],
      ),
      child: Stack(
        children: [
          // Background image (48% width on right)
          Positioned(
            top: 0, bottom: 0, right: 0,
            width: MediaQuery.of(context).size.width * 0.42,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Image.asset(
                'assets/images/desert-hero.png',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(color: AppColors.cream),
              ),
            ),
          ),
          // Gradient overlay
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(26),
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [Colors.white, Colors.white.withOpacity(0.86), Colors.white.withOpacity(0.0)],
                ),
              ),
            ),
          ),
          // Content
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('مرحباً بك', style: GoogleFonts.cairo(fontSize: 25, fontWeight: FontWeight.w800, color: AppColors.ink)),
                    const SizedBox(height: 8),
                    Text('يا ضيف مواعيدك', style: GoogleFonts.cairo(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.ink, height: 1.2)),
                    const SizedBox(height: 16),
                    Row(children: [
                      Text('نسعد بخدمتك كل يوم', style: GoogleFonts.cairo(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.brown)),
                      const SizedBox(width: 6),
                      Icon(Icons.auto_awesome, color: AppColors.gold, size: 16),
                    ]),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Container(
                width: 60, height: 60,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.8),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderGold),
                ),
                child: Center(child: Text('م', style: GoogleFonts.cairo(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.gold))),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDailyCardRow(BuildContext context) {
    return GestureDetector(
      onTap: () => context.pushNamed('daily-card'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.borderGold),
          gradient: LinearGradient(colors: [AppColors.gold.withOpacity(0.08), AppColors.gold.withOpacity(0.03)]),
          boxShadow: [BoxShadow(color: AppColors.brown.withOpacity(0.08), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Row(children: [
          Container(
            width: 56, height: 56,
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [AppColors.gold, Color(0xFFA78042)]),
              borderRadius: BorderRadius.all(Radius.circular(16)),
            ),
            child: const Icon(Icons.card_giftcard, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('بطاقة يومية', style: GoogleFonts.cairo(fontSize: 19, fontWeight: FontWeight.w800, color: AppColors.ink)),
                const SizedBox(height: 4),
                Text('شارك يومك مع الآخرين', style: GoogleFonts.cairo(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Icon(Icons.chevron_left, color: AppColors.brown, size: 24),
        ]),
      ),
    );
  }

  Widget _buildMenuSection(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.82),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.borderGold),
        boxShadow: [BoxShadow(color: AppColors.brown.withOpacity(0.10), blurRadius: 34, offset: const Offset(0, 14))],
      ),
      child: Column(children: [
        _buildMenuRow(icon: Icons.person_outline_rounded, label: 'الملف الشخصي', onTap: () => context.pushNamed('account')),
        _buildMenuRow(icon: Icons.settings_outlined, label: 'الإعدادات', onTap: () => context.pushNamed('settings')),
        _buildMenuRow(icon: Icons.share_outlined, label: 'مشاركة التطبيق', onTap: () => _shareApp(context)),
        _buildMenuRow(icon: Icons.privacy_tip_outlined, label: 'سياسة الخصوصية', onTap: () => _showPrivacyDialog(context)),
        _buildMenuRow(icon: Icons.article_outlined, label: 'الشروط والأحكام', onTap: () => _showTermsDialog(context)),
        _buildMenuRow(icon: Icons.headphones_outlined, label: 'المساعدة والدعم', onTap: () => _showSupportDialog(context)),
        _buildMenuRow(icon: Icons.logout_rounded, label: 'تسجيل الخروج', isDanger: true, onTap: () => _showLogoutDialog(context)),
      ]),
    );
  }

  Widget _buildMenuRow({required IconData icon, required String label, required VoidCallback onTap, bool isDanger = false}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: Color(0x1AC9A063), width: 1))),
        child: Row(children: [
          Icon(icon, color: isDanger ? const Color(0xFFB9483F) : AppColors.brown, size: 28),
          const SizedBox(width: 16),
          Expanded(child: Text(label, style: GoogleFonts.cairo(fontSize: 21, fontWeight: FontWeight.w800, color: isDanger ? const Color(0xFFB9483F) : AppColors.ink), textAlign: TextAlign.right)),
          Icon(Icons.chevron_left, color: AppColors.textSecondary, size: 20),
        ]),
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
        gradient: const LinearGradient(colors: [Color(0xFFF3E8D6), Color(0xFFFAF7F2)]),
      ),
      child: Row(children: [
        Icon(Icons.lightbulb_outline, color: AppColors.gold.withOpacity(0.35), size: 64),
        const SizedBox(width: 16),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('بارك الله في وقتك', style: GoogleFonts.cairo(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.brown)),
          const SizedBox(height: 8),
          Text('جعلنا الله وإياكم من الموفقين في كل أوقاتنا', style: GoogleFonts.cairo(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.ink)),
        ])),
      ]),
    );
  }

  void _shareApp(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('مشاركة التطبيق', style: GoogleFonts.cairo()), backgroundColor: AppColors.brown));
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(context: context, builder: (context) => AlertDialog(
      backgroundColor: AppColors.paper,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text('تسجيل الخروج', style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.ink)),
      content: Text('هل تريد تسجيل الخروج من حسابك؟', style: GoogleFonts.cairo(fontSize: 14, color: AppColors.textSecondary)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text('إلغاء', style: GoogleFonts.cairo(color: AppColors.textSecondary))),
        ElevatedButton(onPressed: () => Navigator.pop(context), style: ElevatedButton.styleFrom(backgroundColor: AppColors.gold), child: Text('تسجيل الخروج', style: GoogleFonts.cairo(color: Colors.white))),
      ],
    ));
  }

  void _showPrivacyDialog(BuildContext context) {
    showDialog(context: context, builder: (context) => AlertDialog(
      backgroundColor: AppColors.paper,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text('سياسة الخصوصية', style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.ink)),
      content: Text('سياسة الخصوصية قيد التطوير', style: GoogleFonts.cairo(fontSize: 14, color: AppColors.textSecondary)),
      actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text('إغلاق', style: GoogleFonts.cairo(color: AppColors.gold)))],
    ));
  }

  void _showTermsDialog(BuildContext context) {
    showDialog(context: context, builder: (context) => AlertDialog(
      backgroundColor: AppColors.paper,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text('الشروط والأحكام', style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.ink)),
      content: Text('الشروط والأحكام قيد التطوير', style: GoogleFonts.cairo(fontSize: 14, color: AppColors.textSecondary)),
      actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text('إغلاق', style: GoogleFonts.cairo(color: AppColors.gold)))],
    ));
  }

  void _showSupportDialog(BuildContext context) {
    showDialog(context: context, builder: (context) => AlertDialog(
      backgroundColor: AppColors.paper,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text('المساعدة والدعم', style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.ink)),
      content: Text('تواصل معنا عبر: support@mawaeedak.com', style: GoogleFonts.cairo(fontSize: 14, color: AppColors.textSecondary)),
      actions: [TextButton(onPressed: () => Navigator.pop(context), child: Text('إغلاق', style: GoogleFonts.cairo(color: AppColors.gold)))],
    ));
  }
}