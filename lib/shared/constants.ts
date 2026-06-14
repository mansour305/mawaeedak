/**
 * Mawaeedak Constants
 * Shared between Web and Mobile
 */

// Saudi Cities
export const SAUDI_CITIES = [
  { name: 'الرياض', key: 'riyadh', timezone: 'Asia/Riyadh' },
  { name: 'جدة', key: 'jeddah', timezone: 'Asia/Riyadh' },
  { name: 'مكة المكرمة', key: 'mecca', timezone: 'Asia/Riyadh' },
  { name: 'المدينة المنورة', key: 'medina', timezone: 'Asia/Riyadh' },
  { name: 'الدمام', key: 'dammam', timezone: 'Asia/Riyadh' },
  { name: 'الخبر', key: 'khobar', timezone: 'Asia/Riyadh' },
  { name: 'أبها', key: 'abha', timezone: 'Asia/Riyadh' },
  { name: 'تبوك', key: 'tabuk', timezone: 'Asia/Riyadh' },
  { name: 'القصيم', key: 'qassim', timezone: 'Asia/Riyadh' },
  { name: 'حائل', key: 'hail', timezone: 'Asia/Riyadh' },
  { name: 'جازان', key: 'jazan', timezone: 'Asia/Riyadh' },
  { name: 'نجران', key: 'najran', timezone: 'Asia/Riyadh' },
  { name: 'الباحة', key: 'baha', timezone: 'Asia/Riyadh' },
  { name: 'الجوف', key: 'jawf', timezone: 'Asia/Riyadh' },
  { name: 'عسير', key: 'asir', timezone: 'Asia/Riyadh' },
];

// Default City
export const DEFAULT_CITY = SAUDI_CITIES[0];

// Prayer Names (Arabic)
export const PRAYER_NAMES: Record<string, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

// Financial Event Types
export const FINANCIAL_TYPES = {
  salary: { label: 'راتب', icon: '💰' },
  support: { label: 'دعم', icon: '🏠' },
  bill: { label: 'فاتورة', icon: '📄' },
  investment: { label: 'استثمار', icon: '📈' },
};

// Default Daily Message
export const DEFAULT_DAILY_MESSAGE = 'ابدأ يومك بنية طيبة، وتوكل على الله في كل خطوة.';

// App Info
export const APP_INFO = {
  name: 'مواعيدك',
  version: '1.0.0',
  tagline: 'كل مواعيدك في مكان واحد',
};

// Service Centers (8 centers)
export const SERVICE_CENTERS = [
  { id: 1, name: 'مركز الأحوال المدنية', icon: '🪪', services: ['تجديد الهوية', 'تعديل البيانات'] },
  { id: 2, name: 'مركز الجوازات', icon: '📋', services: ['تأشيرات', 'تمديد إقامة'] },
  { id: 3, name: 'مركز المرور', icon: '🚗', services: ['رخصة قيادة', 'تجديد تسجيل'] },
  { id: 4, name: 'مركز البريد', icon: '📮', services: ['طرود', 'حوالات'] },
  { id: 5, name: 'مركز التأمينات', icon: '🏥', services: ['تأمين صحي', 'تعديل بيانات'] },
  { id: 6, name: 'مركز الزكاة', icon: '💵', services: ['زكاة', 'صدقات'] },
  { id: 7, name: 'مركز التعليم', icon: '📚', services: ['سجلات', 'شهادات'] },
  { id: 8, name: 'مركز الخدمات العامة', icon: '🏢', services: ['رخص', 'تصاريح'] },
];
