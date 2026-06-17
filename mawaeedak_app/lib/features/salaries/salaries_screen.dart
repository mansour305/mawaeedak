import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/salary_model.dart';
import '../../data/repositories/salary_repository.dart';

class SalariesScreen extends StatefulWidget {
  const SalariesScreen({super.key});

  @override
  State<SalariesScreen> createState() => _SalariesScreenState();
}

class _SalariesScreenState extends State<SalariesScreen> with SingleTickerProviderStateMixin {
  final SalaryRepository _repository = SalaryRepository();
  late TabController _tabController;
  
  List<Salary> _salaries = [];
  List<Support> _supports = [];
  Salary? _nearest;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    
    _salaries = await _repository.getSalaries();
    _supports = await _repository.getSupports();
    _nearest = await _repository.getNearestPayment();
    
    setState(() => _isLoading = false);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('الرواتب والدعوم'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'الكل'),
            Tab(text: 'الرواتب'),
            Tab(text: 'الدعوم'),
          ],
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: AppColors.accent,
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  if (_nearest != null) _buildNearestCard(),
                  Expanded(
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildAllList(),
                        _buildSalariesList(),
                        _buildSupportsList(),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildNearestCard() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Text(
                  '${_nearest!.daysRemaining}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Text(
                  'يوم',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'أقرب موعد صرف',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _nearest!.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  DateFormat('dd MMMM yyyy', 'ar_SA').format(_nearest!.paymentDate),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          if (_nearest!.amount != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${NumberFormat('#,###').format(_nearest!.amount)} ر.س',
                style: const TextStyle(
                  color: AppColors.primaryDark,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAllList() {
    final allItems = [..._salaries.map((s) => {'type': 'salary', 'data': s}), 
                      ..._supports.map((s) => {'type': 'support', 'data': s})];
    allItems.sort((a, b) {
      final dateA = a['type'] == 'salary' 
          ? (a['data'] as Salary).paymentDate 
          : (a['data'] as Support).paymentDate;
      final dateB = b['type'] == 'salary' 
          ? (b['data'] as Salary).paymentDate 
          : (b['data'] as Support).paymentDate;
      return dateA.compareTo(dateB);
    });

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: allItems.length,
      itemBuilder: (context, index) {
        final item = allItems[index];
        if (item['type'] == 'salary') {
          return _buildSalaryCard(item['data'] as Salary);
        } else {
          return _buildSupportCard(item['data'] as Support);
        }
      },
    );
  }

  Widget _buildSalariesList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _salaries.length,
      itemBuilder: (context, index) => _buildSalaryCard(_salaries[index]),
    );
  }

  Widget _buildSupportsList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _supports.length,
      itemBuilder: (context, index) => _buildSupportCard(_supports[index]),
    );
  }

  Widget _buildSalaryCard(Salary salary) {
    final isPast = salary.paymentDate.isBefore(DateTime.now());
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isPast 
                  ? AppColors.textLight.withOpacity(0.1)
                  : AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.account_balance_wallet_rounded,
              color: isPast ? AppColors.textLight : AppColors.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  salary.title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: isPast ? AppColors.textLight : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  DateFormat('dd MMMM yyyy', 'ar_SA').format(salary.paymentDate),
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (salary.amount != null)
                Text(
                  '${NumberFormat('#,###').format(salary.amount)}',
                  style: TextStyle(
                    color: isPast ? AppColors.textLight : AppColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isPast 
                      ? AppColors.textLight.withOpacity(0.1)
                      : AppColors.accent.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  isPast ? 'تم الصرف' : '${salary.daysRemaining} يوم',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: isPast ? AppColors.textLight : AppColors.accent,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSupportCard(Support support) {
    final isPast = support.paymentDate.isBefore(DateTime.now());
    final isUpcoming = support.daysRemaining >= 0;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isPast 
                  ? AppColors.textLight.withOpacity(0.1)
                  : AppColors.success.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              _getSupportIcon(support.type),
              color: isPast ? AppColors.textLight : AppColors.success,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  support.title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: isPast ? AppColors.textLight : AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  support.typeName,
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              if (support.amount != null)
                Text(
                  '${NumberFormat('#,###').format(support.amount)}',
                  style: TextStyle(
                    color: isPast ? AppColors.textLight : AppColors.success,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isPast 
                      ? AppColors.textLight.withOpacity(0.1)
                      : AppColors.success.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  isPast ? 'تم الصرف' : '${support.daysRemaining} يوم',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: isPast ? AppColors.textLight : AppColors.success,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  IconData _getSupportIcon(String type) {
    switch (type) {
      case 'housing':
        return Icons.home_rounded;
      case 'utility':
        return Icons.electrical_services_rounded;
      case 'citizen_account':
        return Icons.people_rounded;
      case 'education':
        return Icons.school_rounded;
      case 'health':
        return Icons.local_hospital_rounded;
      default:
        return Icons.help_outline_rounded;
    }
  }
}
