/**
 * Mawaeedak Types
 * Shared between Web and Mobile
 */

// User
export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  cityKey: string;
  timezone: string;
  role: 'user' | 'admin';
  onboardingComplete: boolean;
}

// Prayer Times
export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface PrayerItem {
  key: string;
  label: string;
  time: string;
}

// Financial Event
export interface FinancialEvent {
  id: number;
  name: string;
  name_ar?: string;
  date: string;
  amount?: string;
  type: 'salary' | 'support' | 'bill' | 'investment';
  daysRemaining?: number;
}

// Appointment
export interface Appointment {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'medical' | 'official' | 'personal';
}

// Daily Message
export interface DailyMessage {
  id: number;
  message: string;
  display_date?: string;
  is_active: boolean;
}

// Service Center
export interface ServiceCenter {
  id: number;
  name: string;
  icon: string;
  services: string[];
}

// Notification
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'prayer' | 'financial' | 'appointment' | 'general';
  read: boolean;
  createdAt: string;
}

// Tab Item
export interface TabItem {
  name: string;
  label: string;
  iconName: string;
}

// Navigation Params
export type RootStackParamList = {
  '(tabs)': undefined;
  'daily-card': { date?: string };
  'settings': undefined;
  'account': undefined;
};

export type TabParamList = {
  'home': undefined;
  'salary': undefined;
  'services': undefined;
  'calendar': undefined;
  'more': undefined;
};
