import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// MANSOUR-AI ULTRA-STRICT PIXEL-PERFECT HOME SCREEN
/// Design Reference: 8d045ade-58e7-482e-8d34-94a380e4d8a5.png

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentNavIndex = 0;
  final String _currentCity = 'الرياض';
  final String _currentDate = '17/06/2026';
  
  // Prayer times (static for UI design)
  final List<Map<String, dynamic>> _prayerTimes = [
    {'name': 'الفجر', 'time': '06:30'},
    {'name': 'الظهر', 'time': '11:45'},
    {'name': 'العصر', 'time': '15:15'},
    {'name': 'المغرب', 'time': '18:30'},
    {'name': 'العشاء', 'time': '20:00'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: Directionality(
        textDirection: TextDirection.rtl,
        child: Column(
          children: [
            // ========== HEADER SECTION ==========
            Container(
              height: 180,
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color(0xFF1A5F7A),
                    Color(0xFF159895),
                    Color(0xFF57C5B6),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(30),
                  bottomRight: Radius.circular(30),
                ),
              ),
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Column(
                    children: [
                      // Header Row: City selector + Title
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // City Selector
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(
                                  Icons.location_on,
                                  color: Colors.white,
                                  size: 18,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  _currentCity,
                                  style: GoogleFonts.ibmPlexSansArabic(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(
                                  Icons.keyboard_arrow_down,
                                  color: Colors.white,
                                  size: 18,
                                ),
                              ],
                            ),
                          ),
                          // Notification Icon
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Stack(
                              alignment: Alignment.topRight,
                              children: [
                                const Center(
                                  child: Icon(
                                    Icons.notifications_none,
                                    color: Colors.white,
                                    size: 26,
                                  ),
                                ),
                                Positioned(
                                  top: 8,
                                  right: 8,
                                  child: Container(
                                    width: 10,
                                    height: 10,
                                    decoration: const BoxDecoration(
                                      color: Color(0xFFFF4757),
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      // Welcome Text - CENTERED
                      Column(
                        children: [
                          Text(
                            'مرحباً بك',
                            style: GoogleFonts.ibmPlexSansArabic(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'مواعيدك',
                            style: GoogleFonts.ibmPlexSansArabic(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                    ],
                  ),
                ),
              ),
            ),

            // ========== CONTENT SECTION ==========
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // ========== PRAYER TIMES CARD ==========
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 15,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Prayer Times Header
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF159895).withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Icon(
                                      Icons.access_time,
                                      color: Color(0xFF159895),
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    'مواقيت الصلاة',
                                    style: GoogleFonts.ibmPlexSansArabic(
                                      color: const Color(0xFF1E293B),
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              Text(
                                _currentDate,
                                style: GoogleFonts.ibmPlexSansArabic(
                                  color: const Color(0xFF64748B),
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          
                          // Prayer Times Grid
                          ...List.generate(_prayerTimes.length, (index) {
                            final prayer = _prayerTimes[index];
                            final isEven = index % 2 == 0;
                            return Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: isEven 
                                    ? const Color(0xFFF8FAFC) 
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: const Color(0xFFE2E8F0),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    prayer['name'],
                                    style: GoogleFonts.ibmPlexSansArabic(
                                      color: const Color(0xFF1E293B),
                                      fontSize: 16,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  Text(
                                    prayer['time'],
                                    style: GoogleFonts.ibmPlexSansArabic(
                                      color: const Color(0xFF64748B),
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ========== NO UPCOMING APPOINTMENTS TEXT ==========
                    Text(
                      'لا توجد مواعيد قادمة',
                      style: GoogleFonts.ibmPlexSansArabic(
                        color: const Color(0xFF94A3B8),
                        fontSize: 16,
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ========== THREE ACTION BUTTONS ==========
                    Row(
                      children: [
                        // الدعم Button
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.support_agent_rounded,
                            title: 'الدعم',
                            color: const Color(0xFF3B82F6),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // رحلتي Button
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.flight_takeoff_rounded,
                            title: 'رحلتي',
                            color: const Color(0xFF22C55E),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // أضف موعد Button
                        Expanded(
                          child: _buildActionButton(
                            icon: Icons.add_circle_rounded,
                            title: 'أضف موعد',
                            color: const Color(0xFF159895),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // ========== BOTTOM NAVIGATION BAR ==========
            Container(
              height: 70,
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: SafeArea(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildNavItem(0, Icons.home_rounded, 'الرئيسية'),
                    _buildNavItem(1, Icons.calendar_month_rounded, 'التقويم'),
                    _buildNavItem(2, Icons.notifications_rounded, 'الإشعارات'),
                    _buildNavItem(3, Icons.account_balance_wallet_rounded, 'الرواتب'),
                    _buildNavItem(4, Icons.widgets_rounded, 'الخدمات'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String title,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: color,
              size: 28,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: GoogleFonts.ibmPlexSansArabic(
              color: const Color(0xFF1E293B),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _currentNavIndex == index;
    return GestureDetector(
      onTap: () {
        setState(() {
          _currentNavIndex = index;
        });
      },
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 70,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: isSelected ? const Color(0xFF159895) : const Color(0xFF94A3B8),
              size: 26,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.ibmPlexSansArabic(
                color: isSelected ? const Color(0xFF159895) : const Color(0xFF94A3B8),
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
