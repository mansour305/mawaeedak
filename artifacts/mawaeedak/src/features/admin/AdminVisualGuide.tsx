/**
 * AdminVisualGuide — Phase 13L
 * دليل التصميم البصري: الألوان، الطباعة، المكوّنات
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Palette, Type, Layers, Component } from "lucide-react";

const COLORS = [
  { name: "الأولية — ذهبي تراثي", var: "hsl(36 72% 36%)", hex: "#9C6A1A", role: "primary" },
  { name: "البطاقة — كريمي", var: "hsl(36 42% 94%)", hex: "#F5EDDE", role: "card" },
  { name: "الخلفية — رق أبيض", var: "hsl(38 52% 96%)", hex: "#FBF5EA", role: "background" },
  { name: "الهيدر الداكن", var: "hsl(22 62% 16%)", hex: "#301504", role: "header" },
  { name: "الذهبي المميّز", var: "hsl(38 80% 58%)", hex: "#D4A228", role: "gold" },
  { name: "النص الأساسي", var: "hsl(22 32% 20%)", hex: "#3D2315", role: "foreground" },
  { name: "النص الثانوي", var: "hsl(30 18% 50%)", hex: "#8C7260", role: "muted" },
  { name: "التدمير — أحمر", var: "hsl(0 62% 48%)", hex: "#C53030", role: "destructive" },
];

const TYPOGRAPHY = [
  { label: "العنوان الرئيسي", size: "22–26px", weight: "900 (Black)", sample: "مواعيدك — اليوم الوطني" },
  { label: "العنوان الثانوي", size: "17–20px", weight: "700–800 (ExtraBold)", sample: "مواعيدي للشهر القادم" },
  { label: "نص البطاقة", size: "13–15px", weight: "600–700 (SemiBold/Bold)", sample: "موعد مراجعة المرتب" },
  { label: "النص الصغير / التسمية", size: "10–12px", weight: "500–600 (Medium)", sample: "الاثنين ١٢ ذو القعدة" },
  { label: "Badge / Chip", size: "9–11px", weight: "700 (Bold + كبسلة)", sample: "عالية · متوسطة · منخفضة" },
];

const SPACING = [
  { name: "xs — 4px", sample: "gap-1 / p-1" },
  { name: "sm — 8px", sample: "gap-2 / p-2" },
  { name: "md — 12–16px", sample: "gap-3 / p-4 (بطاقات)" },
  { name: "lg — 20–24px", sample: "p-5 / py-5 (قسم رئيسي)" },
  { name: "xl — 32px+", sample: "py-8 / mb-6 (فواصل)" },
];

const RADII = [
  { name: "مصغّر — 8px", class: "rounded-lg", use: "badge, chip, زر صغير" },
  { name: "قياسي — 12px", class: "rounded-xl", use: "زر رئيسي، input" },
  { name: "بطاقة — 16px", class: "rounded-2xl", use: "heritage card" },
  { name: "كامل — 50%", class: "rounded-full", use: "avatar, BottomNav pill" },
];

const SHADOW_LEVELS = [
  { name: "طفيف", css: "0 2px 8px -2px rgba(80,40,10,0.10)", use: "tab list, input" },
  { name: "قياسي", css: "0 2px 10px -2px rgba(80,40,10,0.13)", use: "heritage card" },
  { name: "عميق", css: "0 8px 28px -4px rgba(60,28,4,0.26)", use: "calendar hero, hero card" },
  { name: "Avatar / Button", css: "0 4px 16px rgba(0,0,0,0.45)", use: "circular avatar" },
];

export default function AdminVisualGuide() {
  return (
    <div className="space-y-6 pb-8 rtl">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground mb-1">دليل التصميم البصري</h1>
        <p className="text-sm text-muted-foreground">
          مرجع الهوية السعودية التراثية الفاخرة — الألوان · الطباعة · الأبعاد · المكوّنات
        </p>
      </div>

      {/* ═══ Color Palette ══════════════════════════════════════ */}
      <Card className="border-card-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            لوحة الألوان
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {COLORS.map((c) => (
              <div
                key={c.role}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card)/0.6)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl shrink-0 border"
                  style={{
                    background: c.var,
                    borderColor: "rgba(0,0,0,0.12)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-foreground leading-tight truncate">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══ Typography ══════════════════════════════════════════ */}
      <Card className="border-card-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Type className="w-4 h-4 text-primary" />
            </div>
            الطباعة — Tajawal Arabic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TYPOGRAPHY.map((t, i) => (
            <div
              key={i}
              className="p-3 rounded-xl"
              style={{
                background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(36 28% 91%) 100%)",
                border: "1px solid hsl(var(--card-border))",
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <Badge variant="outline" className="text-[9px] shrink-0">{t.label}</Badge>
                <span className="text-[10px] text-muted-foreground font-mono text-left">{t.size} · {t.weight}</span>
              </div>
              <p
                className="text-foreground leading-relaxed"
                style={{ fontFamily: "'Tajawal', sans-serif", fontWeight: i === 0 ? 900 : i === 1 ? 800 : i === 2 ? 700 : 600 }}
              >
                {t.sample}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ═══ Spacing & Radius ════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-card-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-primary" />
              المسافات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {SPACING.map((s) => (
              <div key={s.name} className="text-[11px] flex justify-between">
                <span className="font-semibold text-foreground">{s.name}</span>
                <span className="text-muted-foreground font-mono">{s.sample}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-card-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Component className="w-4 h-4 text-primary" />
              الحواف
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {RADII.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 bg-primary/15 border border-primary/30 shrink-0 ${r.class}`}
                />
                <div>
                  <div className="text-[11px] font-semibold text-foreground">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.use}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ═══ Shadows ══════════════════════════════════════════════ */}
      <Card className="border-card-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">مستويات الظل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SHADOW_LEVELS.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-background"
              style={{ boxShadow: s.css, border: "1px solid hsl(var(--border)/0.5)" }}
            >
              <div>
                <div className="text-[12px] font-bold text-foreground">{s.name}</div>
                <div className="text-[10px] text-muted-foreground">{s.use}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ═══ Component Samples ════════════════════════════════════ */}
      <Card className="border-card-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">عيّنات المكوّنات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Buttons */}
          <div>
            <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">الأزرار</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="font-bold">رئيسي</Button>
              <Button size="sm" variant="outline" className="font-bold">ثانوي</Button>
              <Button size="sm" variant="destructive" className="font-bold">تدمير</Button>
              <Button size="sm" variant="ghost" className="font-bold">شبح</Button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">الشارات</p>
            <div className="flex flex-wrap gap-2">
              <Badge>افتراضي</Badge>
              <Badge variant="outline">إطار</Badge>
              <Badge variant="secondary">ثانوي</Badge>
              <Badge variant="destructive">خطر</Badge>
              <Badge
                className="text-[10px]"
                style={{ background: "hsl(var(--gold)/0.15)", color: "hsl(var(--gold-muted))", border: "1px solid hsl(var(--gold)/0.4)" }}
              >
                ذهبي
              </Badge>
            </div>
          </div>

          {/* Heritage Card */}
          <div>
            <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">بطاقة تراثية</p>
            <div
              className="rounded-2xl p-4"
              style={{
                background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(36 28% 91%) 100%)",
                border: "1.5px solid hsl(34 48% 66% / 0.75)",
                boxShadow: "0 4px 18px -4px rgba(60,28,4,0.22), inset 0 1px 0 rgba(255,242,200,0.20)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-[14px] text-foreground">موعد موعدي</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">الإثنين · ١٤:٣٠</div>
                </div>
                <div
                  className="text-[22px] font-extrabold w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))" }}
                >
                  ١٢
                </div>
              </div>
            </div>
          </div>

          {/* Heritage header */}
          <div>
            <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">هيدر داكن (Header Dark)</p>
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, hsl(22 62% 18%) 0%, hsl(18 68% 14%) 100%)",
                border: "1px solid hsl(38 60% 40% / 0.40)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[16px]"
                style={{ background: "hsl(38 60% 36%)", color: "hsl(38 88% 88%)", border: "2px solid hsl(38 70% 52% / 0.60)" }}
              >
                م
              </div>
              <div>
                <div className="text-[14px] font-extrabold" style={{ color: "hsl(38 80% 85%)" }}>مواعيدك</div>
                <div className="text-[11px]" style={{ color: "hsl(38 55% 60%)" }}>التراث التقني الفاخر</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
