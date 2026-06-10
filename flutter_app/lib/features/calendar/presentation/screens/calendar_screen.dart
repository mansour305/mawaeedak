import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../data/models/models.dart';
import '../../../home/providers/providers.dart';

class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  late DateTime _currentDate;
  late DateTime _selectedDate;

  @override
  void initState() {
    super.initState();
    _currentDate = DateTime.now();
    _selectedDate = DateTime.now();
  }

  @override
  Widget build(BuildContext context) {
    final appointments = ref.watch(appointmentsProvider);
    final selectedDayAppointments = appointments
        .where((a) => a.date == _formatDate(_selectedDate))
        .toList();

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
                _buildHeader(),
                const SizedBox(height: 16),
                // Month Navigation
                _buildMonthNavigation(),
                const SizedBox(height: 16),
                // Days Header
                _buildDaysHeader(),
                // Calendar Grid
                _buildCalendarGrid(appointments),
                const SizedBox(height: 24),
                // Selected Day Appointments
                _buildAppointmentsSection(selectedDayAppointments),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
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
              child: Icon(Icons.calendar_month, color: AppColors.gold, size: 28),
            ),
            const SizedBox(width: 16),
            Text('التقويم', style: GoogleFonts.cairo(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.ink, height: 1.3)),
          ],
        ),
        GestureDetector(
          onTap: () {
            setState(() {
              _currentDate = DateTime.now();
              _selectedDate = DateTime.now();
            });
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.gold,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [BoxShadow(color: AppColors.gold.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4))],
            ),
            child: Text('اليوم', style: GoogleFonts.cairo(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600)),
          ),
        ),
      ],
    );
  }

  Widget _buildMonthNavigation() {
    final monthName = AppConstants.arabicMonths[_currentDate.month - 1];
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: () => _changeMonth(-1),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.cream,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.chevron_right, color: AppColors.brown),
          ),
        ),
        Text(
          '$monthName ${_currentDate.year}',
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.ink,
          ),
        ),
        GestureDetector(
          onTap: () => _changeMonth(1),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.cream,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.chevron_left, color: AppColors.brown),
          ),
        ),
      ],
    );
  }

  Widget _buildDaysHeader() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: AppConstants.arabicDays
            .map((day) => Expanded(
                  child: Center(
                    child: Text(
                      day,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ))
            .toList(),
      ),
    );
  }

  Widget _buildCalendarGrid(List<Appointment> appointments) {
    final days = _getMonthDays();
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 7,
        childAspectRatio: 1,
      ),
      itemCount: days.length,
      itemBuilder: (context, index) {
        final date = days[index];
        final isCurrentMonth = date.month == _currentDate.month;
        final isToday = _isToday(date);
        final isSelected = _formatDate(date) == _formatDate(_selectedDate);
        final hasAppointment = appointments.any((a) => a.date == _formatDate(date));

        return GestureDetector(
          onTap: () => setState(() => _selectedDate = date),
          child: Container(
            margin: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: isSelected
                  ? AppColors.gold
                  : isToday
                      ? AppColors.gold.withOpacity(0.2)
                      : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                Text(
                  '${date.day}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isSelected || isToday
                        ? FontWeight.w700
                        : FontWeight.w500,
                    color: isSelected
                        ? Colors.white
                        : isCurrentMonth
                            ? AppColors.ink
                            : AppColors.textSecondary.withOpacity(0.5),
                  ),
                ),
                if (hasAppointment && !isSelected)
                  Positioned(
                    bottom: 6,
                    child: Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.gold,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAppointmentsSection(List<Appointment> appointments) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'مواعيد ${_formatDate(_selectedDate)}',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.ink,
              ),
            ),
            ElevatedButton.icon(
              onPressed: () => _showAddAppointmentDialog(),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('إضافة'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (appointments.isEmpty)
          _buildEmptyState()
        else
          ...appointments.map((apt) => _buildAppointmentCard(apt)),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        children: [
          const Text('📅', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          const Text(
            'لا توجد مواعيد في هذا اليوم',
            style: TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: () => _showAddAppointmentDialog(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.cream,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: const Text(
                'إضافة موعد جديد',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.gold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppointmentCard(Appointment appointment) {
    final typeInfo = AppConstants.appointmentTypes[appointment.type] ?? {};
    final icon = typeInfo['icon'] ?? '📅';
    final color = Color(typeInfo['color'] ?? 0xFFC9A063);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.cream,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Text(icon, style: const TextStyle(fontSize: 24)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  appointment.title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.ink,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      appointment.time,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (appointment.notes != null && appointment.notes!.isNotEmpty) ...[
                      const SizedBox(width: 12),
                      Text(
                        appointment.notes!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () => _deleteAppointment(appointment.id),
            icon: const Icon(Icons.delete_outline, color: AppColors.error),
          ),
        ],
      ),
    );
  }

  List<DateTime> _getMonthDays() {
    final firstDay = DateTime(_currentDate.year, _currentDate.month, 1);
    final lastDay = DateTime(_currentDate.year, _currentDate.month + 1, 0);

    final days = <DateTime>[];

    // Add padding for first week
    for (int i = firstDay.weekday % 7 - 1; i >= 0; i--) {
      days.add(firstDay.subtract(Duration(days: i + 1)));
    }

    // Add month days
    for (int d = 1; d <= lastDay.day; d++) {
      days.add(DateTime(_currentDate.year, _currentDate.month, d));
    }

    // Add padding for last week
    final remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (int i = 1; i <= remaining; i++) {
        days.add(DateTime(_currentDate.year, _currentDate.month + 1, i));
      }
    }

    return days;
  }

  bool _isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
  }

  String _formatDate(DateTime date) {
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  void _changeMonth(int delta) {
    setState(() {
      _currentDate = DateTime(
        _currentDate.year,
        _currentDate.month + delta,
        1,
      );
    });
  }

  void _showAddAppointmentDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _AddAppointmentSheet(
        selectedDate: _formatDate(_selectedDate),
        onAdd: (appointment) {
          ref.read(appointmentsProvider.notifier).addAppointment(appointment);
        },
      ),
    );
  }

  void _deleteAppointment(String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف الموعد'),
        content: const Text('هل أنت متأكد من حذف هذا الموعد؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () {
              ref.read(appointmentsProvider.notifier).removeAppointment(id);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
  }
}

class _AddAppointmentSheet extends StatefulWidget {
  final String selectedDate;
  final Function(Appointment) onAdd;

  const _AddAppointmentSheet({
    required this.selectedDate,
    required this.onAdd,
  });

  @override
  State<_AddAppointmentSheet> createState() => _AddAppointmentSheetState();
}

class _AddAppointmentSheetState extends State<_AddAppointmentSheet> {
  final _titleController = TextEditingController();
  final _timeController = TextEditingController(text: '09:00');
  String _selectedType = 'personal';
  String _selectedDate = '';

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.selectedDate;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _timeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.paper,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 40,
      ),
      child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'إضافة موعد',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: AppColors.ink),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              'العنوان',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                hintText: 'أدخل عنوان الموعد',
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Text(
                  'التاريخ: ',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.ink,
                  ),
                ),
                Text(
                  _selectedDate,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.gold,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'الوقت',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _timeController,
              decoration: const InputDecoration(
                hintText: 'HH:MM',
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'النوع',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildTypeOption('medical', '🏥', 'طبي'),
                const SizedBox(width: 10),
                _buildTypeOption('official', '📋', 'رسمية'),
                const SizedBox(width: 10),
                _buildTypeOption('personal', '📅', 'شخصي'),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('إلغاء'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _addAppointment,
                    child: const Text('إضافة الموعد'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeOption(String type, String icon, String label) {
    final isSelected = _selectedType == type;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedType = type),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.gold.withOpacity(0.1) : AppColors.cream,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.gold : AppColors.border,
            ),
          ),
          child: Column(
            children: [
              Text(icon, style: const TextStyle(fontSize: 20)),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: isSelected ? AppColors.gold : AppColors.textSecondary,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _addAppointment() {
    if (_titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال عنوان الموعد')),
      );
      return;
    }

    final appointment = Appointment(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: _titleController.text,
      date: _selectedDate,
      time: _timeController.text,
      type: _selectedType,
    );

    widget.onAdd(appointment);
    Navigator.pop(context);
  }
}