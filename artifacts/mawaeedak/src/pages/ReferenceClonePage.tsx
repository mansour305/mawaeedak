/**
 * ReferenceClonePage — Phase 15
 * دليل التصميم الكامل — يعرض نظام مواعيدك البصري فعلياً
 * المكونات الحقيقية التي تستخدمها الصفحات، وليس صور فقط.
 */
import { AppShell } from "@/components/layout/AppShell";
import {
  MawaeedakCard,
  MawaeedakSection,
  MawaeedakButton,
  MawaeedakBadge,
  MawaeedakDivider,
  MawaeedakEmptyState,
} from "@/components/mawaeedak";
import {
  Home, Calendar, Wallet, Layers, User, Bell, Star,
  Briefcase, Plane, BookOpen, Newspaper, GraduationCap,
  HandHeart, MessageSquare, BookMarked, Clock, Plus,
  TrendingUp, HandCoins, AlertCircle, Loader2, Check,
  LayoutDashboard, Users, Zap, Paintbrush,
} from "lucide-react";

/* ═══════════════════════════ COLOUR SWATCH ═══════════════════════════ */
const colors: { name: string; hex: string; label: string }[] = [
  { name: "Espresso Dark",   hex: "#281E13", label: "هيدر / سطح داكن" },
  { name: "Heritage Brown",  hex: "#604E2B", label: "بني تراثي" },
  { name: "Heritage Gold",   hex: "#C9852A", label: "ذهبي تراثي — Primary" },
  { name: "Gold Light",      hex: "#E2B96A", label: "ذهبي فاتح — Accent" },
  { name: "Parchment",       hex: "#F2E8D0", label: "ورقة بيج" },
  { name: "Cream Card",      hex: "#FDF5E9", label: "بطاقة كريمية" },
  { name: "Warm Ivory",      hex: "#FFFBF4", label: "عاج دافئ" },
  { name: "Heritage Text",   hex: "#2E1A0A", label: "نص داكن" },
];

/* ═══════════════════════════ TYPOGRAPHY ═══════════════════════════════ */
const typeScales = [
  { label: "عنوان ضخم — Hero",    size: "28px", weight: 900, sample: "مواعيدك" },
  { label: "عنوان رئيسي — H1",    size: "20px", weight: 800, sample: "ملخص مالي" },
  { label: "عنوان ثانوي — H2",    size: "16px", weight: 700, sample: "مواقيت الصلاة" },
  { label: "نص متوسط — Body",     size: "14px", weight: 500, sample: "حفظ بياناتك وتنظيم وقتك" },
  { label: "نص صغير — Small",    size: "12px", weight: 500, sample: "تطبيق مواعيدك لإدارة وقتك" },
  { label: "نص دقيق — Caption",  size: "10px", weight: 700, sample: "جميع الحقوق محفوظة © ٢٠٢٥" },
];

/* ═══════════════════════════ PRAYER CELL ═══════════════════════════════ */
const prayers = [
  { name: "الفجر",   time: "04:42" },
  { name: "الشروق",  time: "06:07" },
  { name: "الظهر",   time: "11:58" },
  { name: "العصر",   time: "15:26" },
  { name: "المغرب",  time: "18:49" },
  { name: "العشاء",  time: "20:19" },
];

/* ═══════════════════════════ CENTER TILES ═══════════════════════════════ */
const centers = [
  { icon: Briefcase,   label: "مركز الأعمال",  color: "#8C6622" },
  { icon: Plane,       label: "مركز السفر",    color: "#8C6622" },
  { icon: GraduationCap, label: "مركز الدراسة", color: "#8C6622" },
  { icon: Newspaper,   label: "مركز الأخبار",  color: "#8C6622" },
  { icon: BookOpen,    label: "مركز الوظائف",  color: "#8C6622" },
  { icon: HandHeart,   label: "مركز التهاني",  color: "#8C6622" },
  { icon: MessageSquare, label: "الشكاوى",     color: "#8C6622" },
  { icon: BookMarked,  label: "ستوري اليوم",   color: "#8C6622" },
];

/* ═══════════════════════════ STAT CARDS ═══════════════════════════════ */
const statCards = [
  { icon: Users,        label: "المستخدمون",  value: "12,547",  pct: "+12.3%", cls: "mw-stat-card mw-stat-card-users" },
  { icon: Calendar,     label: "المواعيد",    value: "342",     pct: "+8.1%",  cls: "mw-stat-card mw-stat-card-appointments" },
  { icon: TrendingUp,   label: "الإيرادات",   value: "128,540", pct: "+15.8%", cls: "mw-stat-card mw-stat-card-financial" },
  { icon: Bell,         label: "الإشعارات",   value: "1,892",   pct: "+10.4%", cls: "mw-stat-card mw-stat-card-notifications" },
];

/* ═══════════════════════════════════════════════════════════════════════ */

export default function ReferenceClonePage() {
  return (
    <AppShell title="دليل التصميم">
      <div className="flex flex-col gap-6 py-4">

        {/* ─────── PAGE TITLE ─────── */}
        <div
          className="rounded-2xl text-center py-5 px-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(160deg, hsl(22 72% 16%) 0%, hsl(16 76% 11%) 100%)",
            border: "1.5px solid hsl(38 65% 40% / 0.45)",
            boxShadow: "0 8px 32px rgba(8,3,0,0.35)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(38 55% 48% / 0.55))" }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ background: "hsl(38 72% 55%)" }} />
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(38 55% 48% / 0.55), transparent)" }} />
          </div>
          <h1
            style={{
              fontSize: "22px", fontWeight: 900,
              color: "hsl(38 86% 90%)",
              fontFamily: "'Tajawal', sans-serif",
              textShadow: "0 1px 12px rgba(0,0,0,0.55)",
            }}
          >
            دليل العناصر البصرية
          </h1>
          <p style={{ fontSize: "12px", color: "hsl(38 50% 62%)", fontFamily: "'Tajawal', sans-serif", marginTop: 4 }}>
            مواعيدك — Phase 15 Reference Clone System
          </p>
        </div>

        {/* ─────── COLOUR PALETTE ─────── */}
        <MawaeedakSection title="الألوان" />
        <div className="grid grid-cols-4 gap-2">
          {colors.map((c) => (
            <div key={c.hex} className="flex flex-col gap-1">
              <div
                style={{
                  height: 48,
                  borderRadius: 10,
                  background: c.hex,
                  border: "1.5px solid rgba(0,0,0,0.10)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 700, color: "hsl(20 52% 20%)", fontFamily: "'Tajawal',sans-serif", textAlign: "center", lineHeight: 1.2 }}>
                {c.label}
              </span>
              <span style={{ fontSize: 8, color: "hsl(24 18% 52%)", fontFamily: "monospace", textAlign: "center" }}>{c.hex}</span>
            </div>
          ))}
        </div>

        <MawaeedakDivider />

        {/* ─────── TYPOGRAPHY ─────── */}
        <MawaeedakSection title="الطباعة — Tajawal" />
        <MawaeedakCard>
          <div className="flex flex-col gap-3">
            {typeScales.map((t) => (
              <div key={t.label} className="flex flex-col gap-0.5">
                <span style={{ fontSize: 10, fontWeight: 700, color: "hsl(38 45% 50%)", fontFamily: "'Tajawal', sans-serif" }}>
                  {t.label}
                </span>
                <span style={{ fontSize: t.size, fontWeight: t.weight, color: "hsl(20 52% 12%)", fontFamily: "'Tajawal', sans-serif", lineHeight: 1.3 }}>
                  {t.sample}
                </span>
              </div>
            ))}
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── CARDS ─────── */}
        <MawaeedakSection title="البطاقات" />

        <MawaeedakCard>
          <p style={{ fontSize: 13, fontWeight: 600, color: "hsl(20 52% 20%)", fontFamily: "'Tajawal', sans-serif" }}>
            بطاقة كريمية — Cream Card
          </p>
          <p style={{ fontSize: 11, color: "hsl(24 18% 52%)", marginTop: 4, fontFamily: "'Tajawal', sans-serif" }}>
            خلفية عاجية دافئة + حدود ذهبية شفافة + ظل عميق
          </p>
        </MawaeedakCard>

        <MawaeedakCard variant="elevated" cornerOrnament>
          <p style={{ fontSize: 13, fontWeight: 600, color: "hsl(20 52% 20%)", fontFamily: "'Tajawal', sans-serif" }}>
            بطاقة مرتفعة + زخارف أركان
          </p>
          <p style={{ fontSize: 11, color: "hsl(24 18% 52%)", marginTop: 4, fontFamily: "'Tajawal', sans-serif" }}>
            ظل أعمق + حدود أوضح + corner ornaments ذهبية
          </p>
        </MawaeedakCard>

        <MawaeedakCard variant="dark">
          <p style={{ fontSize: 13, fontWeight: 600, color: "hsl(38 82% 82%)", fontFamily: "'Tajawal', sans-serif" }}>
            بطاقة داكنة — Dark Heritage Card
          </p>
          <p style={{ fontSize: 11, color: "hsl(38 45% 58%)", marginTop: 4, fontFamily: "'Tajawal', sans-serif" }}>
            تدرج بني داكن + حدود ذهبية خفيفة + ظل عميق
          </p>
        </MawaeedakCard>

        <MawaeedakCard variant="gold">
          <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "'Tajawal', sans-serif" }}>
            بطاقة ذهبية — Gold Story Card
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.80)", marginTop: 4, fontFamily: "'Tajawal', sans-serif" }}>
            تدرج ذهبي كامل — تُستخدم لبطاقة الستوري
          </p>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── BUTTONS ─────── */}
        <MawaeedakSection title="الأزرار" />
        <MawaeedakCard>
          <div className="flex flex-col gap-3">
            <MawaeedakButton variant="gold" fullWidth>
              زر ذهبي — Gold Button
            </MawaeedakButton>
            <MawaeedakButton variant="gold" size="sm" fullWidth>
              زر ذهبي صغير — Small Gold
            </MawaeedakButton>
            <MawaeedakButton variant="dark" fullWidth>
              زر داكن — Dark Button
            </MawaeedakButton>
            <MawaeedakButton variant="outline" fullWidth>
              زر حدودي — Outline Button
            </MawaeedakButton>
            <MawaeedakButton variant="gold" loading fullWidth>
              جارٍ التحميل
            </MawaeedakButton>
            <MawaeedakButton variant="gold" disabled fullWidth>
              معطّل — Disabled
            </MawaeedakButton>
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── BADGES ─────── */}
        <MawaeedakSection title="الشارات والبادجات" />
        <MawaeedakCard>
          <div className="flex flex-wrap gap-2">
            <MawaeedakBadge variant="gold">ذهبي</MawaeedakBadge>
            <MawaeedakBadge variant="dark">داكن</MawaeedakBadge>
            <MawaeedakBadge variant="green">نشط</MawaeedakBadge>
            <MawaeedakBadge variant="red">منتهي</MawaeedakBadge>
            <MawaeedakBadge variant="cream">كريمي</MawaeedakBadge>
            <MawaeedakBadge variant="gold">مُنشأ تلقائياً</MawaeedakBadge>
            <MawaeedakBadge variant="red">عاجل</MawaeedakBadge>
            <MawaeedakBadge variant="green">مكتمل</MawaeedakBadge>
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── DIVIDERS ─────── */}
        <MawaeedakSection title="الفواصل الزخرفية" />
        <MawaeedakCard>
          <div className="flex flex-col gap-4">
            <MawaeedakDivider />
            <MawaeedakDivider label="أو" />
            <MawaeedakDivider />
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── PRAYER TIMES GRID ─────── */}
        <MawaeedakSection title="مواقيت الصلاة" />
        <div className="grid grid-cols-3 gap-2">
          {prayers.map((p) => (
            <div key={p.name} className="mw-prayer-cell">
              <div className="mw-prayer-cell-name">{p.name}</div>
              <div className="mw-prayer-cell-time">{p.time}</div>
            </div>
          ))}
        </div>

        <MawaeedakDivider />

        {/* ─────── CENTERS GRID ─────── */}
        <MawaeedakSection title="شبكة المراكز" />
        <div className="grid grid-cols-4 gap-2">
          {centers.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="mw-center-tile">
                <div className="mw-center-tile-icon">
                  <Icon size={20} color="#D4A040" />
                </div>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "hsl(20 52% 20%)",
                    fontFamily: "'Tajawal', sans-serif",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>

        <MawaeedakDivider />

        {/* ─────── STORY CARD PREVIEW ─────── */}
        <MawaeedakSection title="بطاقة الستوري" />
        <div className="mw-story-card">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.75)", fontFamily: "'Tajawal', sans-serif" }}>
                ستوري اليوم
              </span>
              <MawaeedakBadge variant="dark">مُنشأ تلقائياً</MawaeedakBadge>
            </div>
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                fontFamily: "'Tajawal', sans-serif",
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              الالتزام في الإنفاق لأمان والتخطيط المالي راحة
            </p>
            <div className="flex gap-3">
              {[
                { num: "14", label: "تذكير" },
                { num: "15", label: "مهمة" },
                { num: "57", label: "صلاة" },
                { num: "8",  label: "مناسبة" },
              ].map((item) => (
                <div key={item.label} className="mw-countdown-box mw-countdown-box-normal flex-1">
                  <span className="mw-countdown-num">{item.num}</span>
                  <span className="mw-countdown-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mw-copyright-strip" style={{ marginTop: -4, borderRadius: "0 0 16px 16px" }}>
          مواعيدك — جميع الحقوق محفوظة © ٢٠٢٥
        </div>

        <MawaeedakDivider />

        {/* ─────── FINANCE SUMMARY HEADER ─────── */}
        <MawaeedakSection title="ملخص مالي" />
        <div
          className="mw-finance-header rounded-2xl"
          style={{ border: "1.5px solid hsl(38 55% 35% / 0.35)" }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, fontWeight: 700, color: "hsl(38 50% 60%)", fontFamily: "'Tajawal', sans-serif" }}>
                ذو الحجة ١٤٤٧ هـ
              </span>
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: "hsl(38 72% 52%)" }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "الرواتب", val: "12,750", color: "hsl(38 82% 72%)", icon: <TrendingUp size={14} /> },
                { label: "الدعم",   val: "5,450",  color: "hsl(142 60% 60%)", icon: <HandCoins size={14} /> },
                { label: "الفواتير", val: "7,300",  color: "hsl(8 70% 62%)", icon: <AlertCircle size={14} /> },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-center gap-1" style={{ color: item.color }}>
                    {item.icon}
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Tajawal', sans-serif", color: item.color }}>
                      {item.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'Tajawal', sans-serif", direction: "ltr" }}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <MawaeedakDivider />

        {/* ─────── ADMIN STAT CARDS ─────── */}
        <MawaeedakSection title="بطاقات الإحصاء (لوحة المالك)" />
        <div className="grid grid-cols-2 gap-2">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={s.cls} style={{ borderRadius: 16 }}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: "hsl(38 72% 65%)" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "hsl(38 45% 62%)", fontFamily: "'Tajawal', sans-serif" }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "hsl(38 82% 82%)", fontFamily: "'Tajawal', sans-serif", lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "hsl(142 52% 52%)", marginTop: 4, fontFamily: "'Tajawal', sans-serif" }}>
                  {s.pct} هذا الشهر
                </div>
              </div>
            );
          })}
        </div>

        <MawaeedakDivider />

        {/* ─────── LOADING STATE ─────── */}
        <MawaeedakSection title="حالة التحميل" />
        <MawaeedakCard>
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="mw-skeleton w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="mw-skeleton h-3 rounded-full w-3/4" />
                  <div className="mw-skeleton h-2.5 rounded-full w-1/2" />
                </div>
                <div className="mw-skeleton w-14 h-10 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── EMPTY STATE ─────── */}
        <MawaeedakSection title="حالة فارغة" />
        <MawaeedakCard>
          <MawaeedakEmptyState
            icon={<Bell size={28} style={{ color: "hsl(38 72% 64%)" }} />}
            title="لا توجد إشعارات"
            subtitle="ستظهر هنا إشعاراتك ومواعيدك القادمة"
            action={
              <MawaeedakButton variant="outline" size="sm">
                تحديث
              </MawaeedakButton>
            }
          />
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── BOTTOM NAV PREVIEW ─────── */}
        <MawaeedakSection title="شريط التنقل السفلي" />
        <MawaeedakCard>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, hsl(20 70% 14%) 0%, hsl(18 74% 10%) 100%)",
              border: "1.5px solid hsl(38 55% 35% / 0.40)",
              boxShadow: "0 4px 18px rgba(8,3,0,0.40)",
            }}
          >
            <div className="flex items-center h-16 px-1">
              {[
                { icon: Home,     label: "الرئيسية", active: true },
                { icon: Calendar, label: "التقويم",  active: false },
                { icon: Wallet,   label: "المال",    active: false },
                { icon: Layers,   label: "المراكز", active: false },
                { icon: User,     label: "حسابي",   active: false },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative">
                    {item.active && (
                      <>
                        <div className="mw-nav-pill" />
                        <div className="mw-nav-active-bar" />
                      </>
                    )}
                    <Icon
                      size={item.active ? 22 : 20}
                      className="relative z-10"
                      style={{
                        color: item.active ? "hsl(38 72% 60%)" : "hsl(38 30% 58%)",
                        filter: item.active ? "drop-shadow(0 0 5px hsl(38 72% 60% / 0.55))" : undefined,
                      }}
                      strokeWidth={item.active ? 2.5 : 1.75}
                    />
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        fontFamily: "'Tajawal', sans-serif",
                        color: item.active ? "hsl(38 72% 60%)" : "hsl(38 30% 55%)",
                      }}
                      className="relative z-10"
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── ADMIN LOADING STATE ─────── */}
        <MawaeedakSection title="شاشة التحقق (Admin Loading)" />
        <div
          className="rounded-2xl py-10 flex flex-col items-center gap-4"
          style={{
            background: "radial-gradient(ellipse at top, hsl(36 28% 92%) 0%, hsl(36 22% 88%) 100%)",
            border: "1.5px solid hsl(38 45% 70% / 0.45)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, hsl(22 62% 22%), hsl(18 68% 18%))",
              boxShadow: "0 4px 16px rgba(80,40,10,0.30), 0 0 0 1px hsl(38 55% 40% / 0.35)",
            }}
          >
            <Loader2 size={26} className="animate-spin" style={{ color: "hsl(38 82% 68%)" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "hsl(38 40% 44%)", fontFamily: "'Tajawal', sans-serif" }}>
            جارٍ التحقق…
          </span>
          <span style={{ fontSize: 11, color: "hsl(38 25% 55%)", fontFamily: "'Tajawal', sans-serif" }}>
            مواعيدك — لوحة المالك
          </span>
        </div>

        <MawaeedakDivider />

        {/* ─────── HEADER PREVIEW ─────── */}
        <MawaeedakSection title="هيدر التطبيق" />
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1.5px solid hsl(38 55% 35% / 0.40)",
            boxShadow: "0 8px 28px rgba(8,3,0,0.35)",
          }}
        >
          <div
            style={{
              height: 72,
              background: "linear-gradient(180deg, hsl(20 70% 15%) 0%, hsl(18 74% 10%) 60%, hsl(16 76% 8%) 100%)",
              backgroundImage: [
                "linear-gradient(180deg, hsl(20 70% 15%) 0%, hsl(18 74% 10%) 60%, hsl(16 76% 8%) 100%)",
                "repeating-linear-gradient(45deg, rgba(210,162,60,0.085) 0px, rgba(210,162,60,0.085) 1px, transparent 1px, transparent 11px)",
                "repeating-linear-gradient(-45deg, rgba(210,162,60,0.085) 0px, rgba(210,162,60,0.085) 1px, transparent 1px, transparent 11px)",
              ].join(", "),
              borderBottom: "2.5px solid hsl(38 70% 44%)",
              boxShadow: "0 2px 0 hsl(38 80% 58% / 0.40), 0 6px 28px rgba(8,3,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "hsl(38 86% 90%)",
                fontFamily: "'Tajawal', sans-serif",
                textShadow: "0 1px 10px rgba(0,0,0,0.65)",
                letterSpacing: "0.03em",
              }}
            >
              مواعيدك
            </span>
          </div>
        </div>

        <MawaeedakDivider />

        {/* ─────── INPUTS ─────── */}
        <MawaeedakSection title="حقول الإدخال" />
        <MawaeedakCard>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mw-label">البريد الإلكتروني</label>
              <input className="mw-input" placeholder="example@email.com" dir="ltr" readOnly />
            </div>
            <div>
              <label className="mw-label">كلمة المرور</label>
              <input className="mw-input" type="password" placeholder="••••••••" dir="ltr" readOnly />
            </div>
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── TABS BAR ─────── */}
        <MawaeedakSection title="شريط التبويبات" />
        <MawaeedakCard className="p-2">
          <div className="mw-tabs-bar rounded-xl">
            <div className="mw-tab mw-tab-active">المواعيد</div>
            <div className="mw-tab">الحاسبات</div>
            <div className="mw-tab">سلم الرواتب</div>
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── ADMIN SIDEBAR PREVIEW ─────── */}
        <MawaeedakSection title="الشريط الجانبي (لوحة المالك)" />
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "1.5px solid hsl(38 55% 35% / 0.35)",
            boxShadow: "0 4px 20px rgba(8,3,0,0.28)",
          }}
        >
          {/* Sidebar header */}
          <div
            className="p-4"
            style={{
              background: "linear-gradient(160deg, hsl(22 72% 16%) 0%, hsl(16 72% 12%) 100%)",
              borderBottom: "1px solid hsl(38 55% 35% / 0.35)",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 900, color: "hsl(38 85% 82%)", fontFamily: "'Tajawal', sans-serif" }}>
              مواعيدك
            </div>
            <div style={{ fontSize: 11, color: "hsl(38 50% 58%)", fontFamily: "'Tajawal', sans-serif" }}>
              لوحة المالك
            </div>
          </div>
          {/* Sidebar items */}
          {[
            { icon: LayoutDashboard, label: "لوحة التحكم", active: true },
            { icon: Users,           label: "إدارة الأعضاء", active: false },
            { icon: Calendar,        label: "إدارة المواعيد", active: false },
            { icon: Zap,             label: "الأتمتة اليومية", active: false },
            { icon: Paintbrush,      label: "الثيمات", active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-4 py-3"
                style={item.active ? {
                  background: "hsl(38 72% 52% / 0.12)",
                  borderRight: "3px solid hsl(38 72% 52%)",
                  color: "hsl(38 62% 38%)",
                  fontWeight: 700,
                } : {
                  color: "hsl(38 20% 48%)",
                }}
              >
                <Icon size={16} />
                <span style={{ fontSize: 13, fontFamily: "'Tajawal', sans-serif" }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        <MawaeedakDivider />

        {/* ─────── GOLD DIVIDERS & ORNAMENTS ─────── */}
        <MawaeedakSection title="الزخارف والعناصر الذهبية" />
        <MawaeedakCard>
          <div className="flex flex-col gap-5">
            {/* Gold bar */}
            <div>
              <div
                className="h-1 w-full rounded-full"
                style={{ background: "linear-gradient(90deg, transparent, hsl(38 72% 52%), transparent)" }}
              />
              <span style={{ fontSize: 10, color: "hsl(24 18% 52%)", fontFamily: "'Tajawal', sans-serif" }}>Gold Bar Gradient</span>
            </div>
            {/* Diamond pattern */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(38 55% 55% / 0.6))" }} />
              <div className="w-2 h-2 rotate-45" style={{ background: "hsl(38 72% 52%)" }} />
              <div className="w-1.5 h-1.5 rotate-45" style={{ background: "hsl(38 62% 58%)" }} />
              <div className="w-2 h-2 rotate-45" style={{ background: "hsl(38 72% 52%)" }} />
              <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(38 55% 55% / 0.6), transparent)" }} />
            </div>
            {/* Corner ornament preview */}
            <div
              className="relative rounded-xl p-4 mw-corner-tl mw-corner-tr"
              style={{ background: "hsl(36 32% 90%)", border: "1px solid hsl(38 45% 72% / 0.5)" }}
            >
              <span style={{ fontSize: 12, fontFamily: "'Tajawal', sans-serif", color: "hsl(20 52% 20%)" }}>
                بطاقة بزخارف الأركان (Corner Ornaments)
              </span>
            </div>
          </div>
        </MawaeedakCard>

        <MawaeedakDivider />

        {/* ─────── COPYRIGHT STRIP ─────── */}
        <MawaeedakSection title="شريط الحقوق والشعار" />
        <div>
          <MawaeedakCard variant="gold">
            <div className="relative z-10 text-center py-2">
              <span style={{ fontSize: 18, fontWeight: 900, color: "#fff", fontFamily: "'Tajawal', sans-serif" }}>
                مواعيدك
              </span>
            </div>
          </MawaeedakCard>
          <div className="mw-copyright-strip" style={{ marginTop: 0, borderRadius: "0 0 12px 12px" }}>
            مواعيدك — جميع الحقوق محفوظة © ٢٠٢٥
          </div>
        </div>

        {/* ─────── QUICK SUMMARY ─────── */}
        <MawaeedakSection title="ملخص نظام التصميم" />
        <MawaeedakCard variant="dark">
          <div className="flex flex-col gap-2">
            {[
              { icon: Check, label: "8 ألوان رئيسية مُعرَّفة" },
              { icon: Check, label: "6 مقاسات طباعية" },
              { icon: Check, label: "4 أنواع بطاقات" },
              { icon: Check, label: "3 أنواع أزرار" },
              { icon: Check, label: "5 أنواع شارات" },
              { icon: Check, label: "خانات صلاة + شبكة مراكز" },
              { icon: Check, label: "بطاقة ستوري + شريط حقوق" },
              { icon: Check, label: "بطاقات إحصاء لوحة المالك" },
              { icon: Check, label: "شريط تنقل سفلي + هيدر" },
              { icon: Check, label: "شريط جانبي Admin + عناصر تحميل" },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-2">
                  <Icon size={13} style={{ color: "hsl(38 72% 60%)", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(38 65% 72%)", fontFamily: "'Tajawal', sans-serif" }}>
                    {row.label}
                  </span>
                </div>
              );
            })}
          </div>
        </MawaeedakCard>

        {/* bottom spacer */}
        <div className="h-4" />
      </div>
    </AppShell>
  );
}
