import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/hooks/useStore";
import { useTheme } from "@/hooks/useTheme";
import { generateInitials } from "@/lib/utils";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useLocation, Link } from "wouter";
import {
  Bell, Moon, Sun, LogOut, ChevronLeft, Shield, Wallet,
  Calendar, Newspaper, Briefcase, Star,
  Loader2, Edit2, Trash2, MapPin, Clock, BookOpen, AlertTriangle,
  BadgeCheck, Headphones, Navigation, Navigation2, RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
// Phase 13G: location & timezone hook
import { useLocationPrefs, detectTimezone } from "@/hooks/useLocationPrefs";
import { useTimeFormat } from "@/hooks/useTimeFormat";

const NOTIF_PREFS_KEY = "mawaeedak_notif_prefs_v1";
const PRAYER_PREFS_KEY = "mawaeedak_prayer_prefs_v1";
const CALENDAR_PREFS_KEY = "mawaeedak_calendar_prefs_v1";

const SAUDI_CITIES = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
  "الخبر", "الطائف", "تبوك", "بريدة", "خميس مشيط", "الأحساء",
  "نجران", "جيزان", "أبها", "ينبع", "حائل", "عرعر",
  "سكاكا", "الباحة", "الجبيل",
];

const TIMEZONES = [
  { value: "Asia/Riyadh",  label: "توقيت الرياض (AST +3)" },
  { value: "Asia/Dubai",   label: "توقيت دبي (GST +4)" },
  { value: "Asia/Kuwait",  label: "توقيت الكويت (+3)" },
  { value: "Asia/Bahrain", label: "توقيت البحرين (+3)" },
  { value: "Asia/Qatar",   label: "توقيت قطر (+3)" },
  { value: "UTC",          label: "UTC (+0)" },
];

function loadKey<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

function saveKey(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

const NOTIF_TYPES = [
  { key: "salary",       label: "الرواتب والدعم",         icon: Wallet,    color: "text-amber-600" },
  { key: "bills",        label: "الفواتير والالتزامات",    icon: Wallet,    color: "text-red-500" },
  { key: "prayer",       label: "مواقيت الصلاة",           icon: Star,      color: "text-emerald-600" },
  { key: "appointments", label: "المواعيد الشخصية",       icon: Calendar,  color: "text-blue-500" },
  { key: "news",         label: "الأخبار المهمة",          icon: Newspaper, color: "text-indigo-500" },
  { key: "jobs",         label: "الوظائف الجديدة",         icon: Briefcase, color: "text-violet-500" },
  { key: "story",        label: "ستوري اليوم",             icon: Bell,      color: "text-pink-500" },
];


export default function AccountPage() {
  const { user, setUser } = useStore();
  const { theme, toggleMode } = useTheme();
  const [, setLocation] = useLocation();

  const [isEditOpen, setIsEditOpen]     = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Phase 13G: location & timezone
  const { prefs: locPrefs, gpsLoading, gpsError, requestGPS, setManual } = useLocationPrefs();
  const [manualCity, setManualCity]     = useState(locPrefs.city);
  const [manualTz,   setManualTz]       = useState(locPrefs.timezone || detectTimezone());

  const [editName, setEditName] = useState(user.name);
  const [editCity, setEditCity] = useState(user.city);

  const [prefs, setPrefs] = useState<Record<string, boolean>>(() => {
    const saved = loadKey<Record<string, boolean>>(NOTIF_PREFS_KEY, {});
    const defaults: Record<string, boolean> = {};
    NOTIF_TYPES.forEach(t => { defaults[t.key] = saved[t.key] !== false; });
    return defaults;
  });

  const [prayerPrefs, setPrayerPrefs] = useState(() =>
    loadKey(PRAYER_PREFS_KEY, { city: user.city || "الرياض", showPrayer: true })
  );

  const [calendarPrefs, setCalendarPrefs] = useState(() =>
    loadKey(CALENDAR_PREFS_KEY, { showHijri: true, defaultView: "list" })
  );

  const { format: timeFormat, setFormat: setTimeFormat } = useTimeFormat();
  const enabledCount = NOTIF_TYPES.filter(t => prefs[t.key]).length;

  // Phase 13G: GPS handler
  const handleGPS = async () => {
    try {
      const city = await requestGPS();
      // Sync city to store and prayer prefs
      setUser({ city, timezone: detectTimezone() });
      updatePrayerPref({ city });
      toast({ title: "تم تحديد موقعك", description: `أقرب مدينة: ${city}`, duration: 6000 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تحديد الموقع";
      toast({ title: "تعذّر تحديد الموقع", description: msg, variant: "destructive", duration: 6000 });
    }
  };

  const handleSaveManualLocation = () => {
    setManual(manualCity, manualTz);
    setUser({ city: manualCity, timezone: manualTz });
    updatePrayerPref({ city: manualCity });
    toast({ title: "تم حفظ الموقع اليدوي", description: `${manualCity} · ${manualTz}`, duration: 6000 });
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      toast({ title: "خطأ", description: "الاسم مطلوب", variant: "destructive" });
      return;
    }
    setUser({ name: editName.trim(), city: editCity });
    setIsEditOpen(false);
    toast({ title: "تم حفظ الملف الشخصي" });
  };

  const openEdit = () => {
    setEditName(user.name);
    setEditCity(user.city);
    setIsEditOpen(true);
  };

  const togglePref = (key: string) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveKey(NOTIF_PREFS_KEY, next);
      toast({
        title: next[key] ? "تم تفعيل الإشعار" : "تم إيقاف الإشعار",
        description: NOTIF_TYPES.find(t => t.key === key)?.label,
      });
      return next;
    });
  };

  const updatePrayerPref = (update: Partial<typeof prayerPrefs>) => {
    setPrayerPrefs(prev => {
      const next = { ...prev, ...update };
      saveKey(PRAYER_PREFS_KEY, next);
      toast({ title: "تم حفظ إعدادات الصلاة" });
      return next;
    });
  };

  const updateCalendarPref = (update: Partial<typeof calendarPrefs>) => {
    setCalendarPrefs(prev => {
      const next = { ...prev, ...update };
      saveKey(CALENDAR_PREFS_KEY, next);
      toast({ title: "تم حفظ إعدادات التقويم" });
      return next;
    });
  };


  const handleLogout = async () => {
    const { authSignOut } = await import("@/lib/auth");
    await authSignOut().catch(() => {});
    localStorage.removeItem("app-user");
    setLocation("/");
  };

  const handleDeleteAccount = () => {
    const keys = [
      "app-user", NOTIF_PREFS_KEY, PRAYER_PREFS_KEY,
      CALENDAR_PREFS_KEY, "mawaeedak_work_tasks_v1", "mawaeedak_travel_v1",
      "mawaeedak_travel_checklist_v1", "mawaeedak_theme", "hide-ads",
    ];
    keys.forEach(k => localStorage.removeItem(k));
    toast({ title: "تم مسح البيانات المحلية" });
    setTimeout(() => setLocation("/"), 800);
  };

  return (
    <AppShell title="حسابي">
      <div className="space-y-5 pb-6">

        {/* Profile Card — Heritage hero */}
        <div
          className="-mx-3 overflow-hidden"
          style={{
            background: "linear-gradient(155deg, hsl(22 62% 18%) 0%, hsl(18 68% 14%) 100%)",
            borderBottom: "1.5px solid hsl(38 60% 40% / 0.55)",
          }}
        >
          {/* Gold top strip */}
          <div style={{ height: "2px", background: "linear-gradient(to right, transparent, hsl(38 72% 52% / 0.70), transparent)" }} />

          <div className="px-5 py-5 flex items-center gap-4">
            {/* Circular avatar */}
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[26px] font-extrabold shrink-0"
              style={{
                background: "linear-gradient(145deg, hsl(38 60% 36%), hsl(30 55% 28%))",
                border: "2.5px solid hsl(38 70% 52% / 0.70)",
                color: "hsl(38 88% 88%)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.45), 0 1px 0 rgba(255,220,120,0.20) inset",
                fontFamily: "'Tajawal', sans-serif",
              }}
            >
              {generateInitials(user.name || "م")}
            </div>

            <div className="flex-1 min-w-0">
              <h2
                className="text-[20px] font-extrabold truncate"
                style={{ color: "hsl(38 82% 88%)", fontFamily: "'Tajawal', sans-serif" }}
              >
                {user.name || "مستخدم"}
              </h2>
              <p
                className="text-[13px] flex items-center gap-1 mt-0.5"
                style={{ color: "hsl(38 55% 65%)" }}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {user.city || "الرياض"}
              </p>
              <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                بيانات محلية
              </p>
            </div>

            <Button
              size="sm"
              className="shrink-0 h-9 rounded-xl font-bold"
              style={{
                background: "rgba(255,200,80,0.12)",
                border: "1px solid hsl(38 65% 52% / 0.45)",
                color: "hsl(38 80% 72%)",
              }}
              onClick={openEdit}
            >
              <Edit2 className="w-3.5 h-3.5 ml-1" />
              تعديل
            </Button>
          </div>

          {/* Gold bottom strip */}
          <div style={{ height: "2px", background: "linear-gradient(to right, transparent, hsl(38 68% 50% / 0.55), transparent)" }} />
        </div>

        {/* Display Settings */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wide">إعدادات العرض</h3>
          <Card className="border-border shadow-sm">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <Label htmlFor="dark-mode" className="text-sm font-medium cursor-pointer">الوضع الليلي</Label>
              </div>
              <Switch id="dark-mode" checked={theme === "dark"} onCheckedChange={toggleMode} />
            </div>
          </Card>
        </div>

        {/* ══ Location & Timezone — Phase 13G ══ */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Navigation className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">الموقع والمنطقة الزمنية</h3>
          </div>
          <Card className="border-border shadow-sm">
            <div className="divide-y divide-border">
              {/* Status row */}
              <div className="p-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  locPrefs.source === "gps" ? "bg-emerald-500/10" :
                  locPrefs.source === "manual" ? "bg-blue-500/10" : "bg-muted"
                }`}>
                  {locPrefs.source === "gps"
                    ? <Navigation2 className="w-4 h-4 text-emerald-600" />
                    : <MapPin className="w-4 h-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{locPrefs.city}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {locPrefs.source === "gps" ? "حسب موقعك" :
                     locPrefs.source === "manual" ? "اختيار يدوي" : "الافتراضي"}
                    {" · "}{locPrefs.timezone}
                  </p>
                  {locPrefs.lastUpdated && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      آخر تحديث: {new Date(locPrefs.lastUpdated).toLocaleString("ar-SA", { timeZone: locPrefs.timezone || "Asia/Riyadh", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                {locPrefs.source === "gps" && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-md font-medium shrink-0">GPS</span>
                )}
              </div>

              {/* GPS button */}
              <div className="p-4">
                <Button
                  variant="outline"
                  className="w-full h-10 text-sm font-bold rounded-xl"
                  onClick={handleGPS}
                  disabled={gpsLoading}
                >
                  {gpsLoading
                    ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جارٍ التحديد...</>
                    : <><Navigation2 className="w-4 h-4 ml-2 text-emerald-600" />استخدام موقعي تلقائياً</>}
                </Button>
                {gpsError && (
                  <p className="text-[11px] text-destructive mt-2 text-center">{gpsError}</p>
                )}
              </div>

              {/* Manual selection */}
              <div className="p-4 space-y-3">
                <p className="text-xs font-bold text-muted-foreground">اختيار يدوي</p>
                <div className="space-y-2">
                  <Label className="text-sm">المدينة</Label>
                  <Select value={manualCity} onValueChange={setManualCity}>
                    <SelectTrigger className="h-10 bg-background text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rtl">
                      {SAUDI_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">المنطقة الزمنية</Label>
                  <Select value={manualTz} onValueChange={setManualTz}>
                    <SelectTrigger className="h-10 bg-background text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rtl">
                      {TIMEZONES.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full h-10 font-bold rounded-xl"
                  variant="outline"
                  onClick={handleSaveManualLocation}
                >
                  <RefreshCw className="w-3.5 h-3.5 ml-2" />
                  حفظ الموقع اليدوي
                </Button>
              </div>
            </div>
          </Card>
          <p className="text-xs text-muted-foreground px-1">
            يُستخدم لمواقيت الصلاة والإشعارات المجدولة · الافتراضي: الرياض / Asia/Riyadh
          </p>
        </div>

        {/* Prayer Settings */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Star className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">إعدادات الصلاة</h3>
          </div>
          <Card className="border-border shadow-sm">
            <div className="divide-y divide-border">
              <div className="p-4 space-y-2">
                <Label className="text-sm font-medium">مدينة الصلاة</Label>
                <Select
                  value={prayerPrefs.city}
                  onValueChange={v => updatePrayerPref({ city: v })}
                >
                  <SelectTrigger className="h-11 bg-background text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rtl">
                    {SAUDI_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <Label htmlFor="show-prayer" className="text-sm font-medium cursor-pointer">عرض مواقيت الصلاة في الرئيسية</Label>
                </div>
                <Switch id="show-prayer" checked={prayerPrefs.showPrayer} onCheckedChange={v => updatePrayerPref({ showPrayer: v })} />
              </div>
              {/* صيغة الوقت */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">صيغة الوقت</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {timeFormat === "12h" ? "مثال: 03:45 ص" : "مثال: 03:45"}
                    </p>
                  </div>
                </div>
                <div className="flex rounded-xl overflow-hidden border border-border">
                  <button
                    onClick={() => setTimeFormat("12h")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      timeFormat === "12h"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    12 ساعة
                  </button>
                  <button
                    onClick={() => setTimeFormat("24h")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      timeFormat === "24h"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    24 ساعة
                  </button>
                </div>
              </div>
            </div>
          </Card>
          <p className="text-xs text-muted-foreground px-1">المواقيت تقديرية — يُنصح بمراجعة التقويم الرسمي</p>
        </div>

        {/* Calendar Settings */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">إعدادات التقويم</h3>
          </div>
          <Card className="border-border shadow-sm">
            <div className="divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <Label htmlFor="show-hijri" className="text-sm font-medium cursor-pointer">إظهار التاريخ الهجري</Label>
                </div>
                <Switch id="show-hijri" checked={calendarPrefs.showHijri} onCheckedChange={v => updateCalendarPref({ showHijri: v })} />
              </div>
              <div className="p-4 space-y-2">
                <Label className="text-sm font-medium">طريقة العرض الافتراضية</Label>
                <Select value={calendarPrefs.defaultView} onValueChange={v => updateCalendarPref({ defaultView: v })}>
                  <SelectTrigger className="h-11 bg-background text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rtl">
                    <SelectItem value="list">قائمة</SelectItem>
                    <SelectItem value="month">شهري</SelectItem>
                    <SelectItem value="week">أسبوعي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">إعدادات الإشعارات</h3>
            </div>
            <span className="text-xs text-primary font-medium">{enabledCount}/{NOTIF_TYPES.length} مفعّل</span>
          </div>
          <Card className="border-border shadow-sm">
            <div className="divide-y divide-border">
              {NOTIF_TYPES.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <Label htmlFor={`notif-${key}`} className="text-sm font-medium cursor-pointer">{label}</Label>
                  </div>
                  <Switch id={`notif-${key}`} checked={!!prefs[key]} onCheckedChange={() => togglePref(key)} />
                </div>
              ))}
            </div>
          </Card>
          <p className="text-xs text-muted-foreground px-1">الإشعارات داخلية فقط في الوقت الحالي</p>
        </div>

        {/* Membership */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <BadgeCheck className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">العضوية</h3>
          </div>
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground text-sm">الخطة الحالية</p>
                <p className="text-xs text-muted-foreground mt-0.5">جميع الخدمات الأساسية متاحة مجاناً</p>
              </div>
              <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                مجاني
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Legal Links */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">الخصوصية والقانون</h3>
          </div>
          <Card className="border-border shadow-sm">
            <div className="divide-y divide-border">
              {[
                { href: "/privacy", label: "سياسة الخصوصية" },
                { href: "/terms", label: "شروط الاستخدام" },
                { href: "/disclaimer", label: "إخلاء المسؤولية" },
                { href: "/support", label: "المساعدة والدعم", icon: Headphones },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {Icon ? <Icon className="w-4 h-4 text-muted-foreground" /> : <Shield className="w-4 h-4 text-muted-foreground" />}
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Account Actions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">الحساب</h3>
          </div>
          <div className="space-y-2 pb-2">
            <Button
              variant="destructive"
              className="w-full h-12 text-base font-bold rounded-xl"
              onClick={() => setIsLogoutOpen(true)}
            >
              <LogOut className="w-5 h-5 ml-2 rtl:rotate-180" />
              تسجيل الخروج
            </Button>
            <p className="text-[11px] text-muted-foreground text-center pt-1">
              سيتم تسجيل الخروج والعودة للصفحة الرئيسية
            </p>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="rtl max-w-[400px] rounded-xl">
            <DialogHeader><DialogTitle>تعديل الملف الشخصي</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم <span className="text-destructive">*</span></Label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="اسمك الكامل" />
              </div>
              <div className="space-y-2">
                <Label>المدينة</Label>
                <Select value={editCity} onValueChange={setEditCity}>
                  <SelectTrigger className="h-11 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rtl">
                    {SAUDI_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full h-11 font-bold" onClick={handleSaveProfile}>حفظ التعديلات</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Logout Confirm */}
        <ConfirmDialog
          open={isLogoutOpen}
          onOpenChange={setIsLogoutOpen}
          title="تسجيل الخروج"
          description="هل أنت متأكد؟ ستعود إلى شاشة البداية وتُمسح بيانات الجلسة المحلية."
          confirmText="تسجيل الخروج"
          onConfirm={handleLogout}
        />

        {/* Delete Account Confirm */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="مسح البيانات المحلية"
          description="سيتم حذف جميع بياناتك المحفوظة محلياً (المهام، الرحلات، التفضيلات). لا يمكن التراجع."
          confirmText="مسح البيانات"
          cancelText="إلغاء"
          onConfirm={handleDeleteAccount}
          destructive
        />
      </div>
    </AppShell>
  );
}

