/**
 * AdminSettings — إعدادات التطبيق العامة
 * 
 * Contains: App name, logo, default theme, language, time format (12/24h),
 * timezone (Asia/Riyadh), location settings, notification settings, maintenance mode.
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Globe, Bell, Moon, Sun, Save, Loader2, Shield, Clock, MapPin } from "lucide-react";

const APP_NAME_KEY = "mawaeedak_app_name";
const DEFAULT_THEME_KEY = "mawaeedak_default_theme";
const TIME_FORMAT_KEY = "mawaeedak_time_format";
const TIMEZONE_KEY = "mawaeedak_timezone";
const MAINTENANCE_KEY = "mawaeedak_maintenance";

export default function AdminSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [appName, setAppName] = useState(() => localStorage.getItem(APP_NAME_KEY) || "مواعيدك");
  const [defaultTheme, setDefaultTheme] = useState(() => localStorage.getItem(DEFAULT_THEME_KEY) || "official");
  const [timeFormat, setTimeFormat] = useState(() => localStorage.getItem(TIME_FORMAT_KEY) || "12h");
  const [timezone, setTimezone] = useState(() => localStorage.getItem(TIMEZONE_KEY) || "Asia/Riyadh");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem("mawaeedak_notif_enabled");
    return stored !== "false";
  });
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    return localStorage.getItem(MAINTENANCE_KEY) === "true";
  });
  const [defaultCity, setDefaultCity] = useState(() => localStorage.getItem("mawaeedak_default_city") || "الرياض");

  const SAUDI_CITIES = [
    "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام",
    "الخبر", "الطائف", "تبوك", "بريدة", "خميس مشيط", "الأحساء",
    "نجران", "جيزان", "أبها", "ينبع", "حائل", "عرعر",
    "سكاكا", "الباحة", "الجبيل",
  ];

  const THEMES = [
    { value: "official", label: "الرسمية" },
    { value: "dark", label: "داكن" },
    { value: "light", label: "فاتح" },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem(APP_NAME_KEY, appName);
      localStorage.setItem(DEFAULT_THEME_KEY, defaultTheme);
      localStorage.setItem(TIME_FORMAT_KEY, timeFormat);
      localStorage.setItem(TIMEZONE_KEY, timezone);
      localStorage.setItem("mawaeedak_notif_enabled", String(notificationsEnabled));
      localStorage.setItem("mawaeedak_default_city", defaultCity);
      localStorage.setItem(MAINTENANCE_KEY, String(maintenanceMode));
      toast({ title: "تم حفظ الإعدادات" });
      setSaving(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div 
          className="w-1 h-6 rounded-full"
          style={{ background: "linear-gradient(180deg, hsl(38 62% 52%), hsl(32 55% 42%))" }}
        />
        <h1 className="text-2xl font-extrabold" style={{ color: "hsl(22 62% 18%)" }}>
          الإعدادات
        </h1>
      </div>

      {/* App Identity */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            هوية التطبيق
          </h3>
          <div className="space-y-2">
            <Label>اسم التطبيق</Label>
            <Input value={appName} onChange={e => setAppName(e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-2">
            <Label>الثيم الافتراضي</Label>
            <Select value={defaultTheme} onValueChange={setDefaultTheme}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="rtl">
                {THEMES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Time & Location */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            الوقت والموقع
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>صيغة الوقت</Label>
              <Select value={timeFormat} onValueChange={setTimeFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="rtl">
                  <SelectItem value="12h">12 ساعة (صباحاً/مساءً)</SelectItem>
                  <SelectItem value="24h">24 ساعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المنطقة الزمنية</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="rtl">
                  <SelectItem value="Asia/Riyadh">توقيت الرياض (AST +3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>المدينة الافتراضية</Label>
            <Select value={defaultCity} onValueChange={setDefaultCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="rtl">
                {SAUDI_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            الإعدادات الافتراضية للإشعارات
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">تفعيل الإشعارات افتراضياً</div>
              <div className="text-xs text-muted-foreground">تفعيل تلقائي للإشعارات للمستخدمين الجدد</div>
            </div>
            <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Moon className="w-4 h-4 text-primary" />
            وضع الصيانة
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">تفعيل وضع الصيانة</div>
              <div className="text-xs text-muted-foreground">حظر وصول المستخدمين أثناء الصيانة</div>
            </div>
            <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
          </div>
          {maintenanceMode && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-700">
              وضع الصيانة مفعّل. سيتم حجب التطبيق عن جميع المستخدمين.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <Button className="w-full h-12" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 ml-1" /> حفظ الإعدادات</>}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        ملاحظة: هذه الإعدادات عامة وتؤثر على جميع المستخدمين. الإعدادات الشخصية للمستخدمين لا تتغير.
      </p>
    </div>
  );
}

