/**
 * Date Utilities
 * Shared between Web and Mobile
 */

/**
 * Format date for Arabic display
 */
export function formatGregorianDate(date: Date = new Date()): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName}، ${day} ${month} ${year}`;
}

/**
 * Get Arabic day name
 */
export function getDayName(date: Date = new Date()): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[date.getDay()];
}

/**
 * Format Hijri date (simplified - for display only)
 */
export function formatHijriDate(date: Date = new Date()): string {
  // This is a simplified version - in production would use a proper Hijri library
  const hijriMonths = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  
  // Simplified calculation - for display purposes
  const day = date.getDate();
  const month = hijriMonths[date.getMonth()];
  const year = 1447; // Approximate
  
  return `${day} ${month} ${year}`;
}

/**
 * Get time greeting
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 17) return 'مساء الخير';
  return 'مساء الخير';
}

/**
 * Calculate days remaining until date
 */
export function getDaysRemaining(targetDate: string | Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format countdown string
 */
export function formatCountdown(days: number): string {
  if (days === 0) return 'اليوم';
  if (days === 1) return 'غداً';
  if (days < 7) return `${days} أيام`;
  if (days < 30) return `${Math.floor(days / 7)} أسابيع`;
  return `${Math.floor(days / 30)} شهر`;
}

/**
 * Format time for display (24h to 12h Arabic)
 */
export function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get current date in ISO format
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Get month days array
 */
export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
