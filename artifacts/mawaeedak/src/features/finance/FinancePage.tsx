/**
 * FinancePage — Phase 12O
 *
 * Financial Events CRUD:
 *   Read:   useGatewayFinancialCountdown → API (mode=api/shadow) | Supabase (mode=supabase)
 *   Write:  gwCreateFinancialEvent / gwUpdateFinancialEvent / gwDeleteFinancialEvent
 *             mode=api/shadow → /api/financial-events
 *             mode=supabase   → Supabase INSERT/UPDATE/DELETE (.or legacy_id/id)
 *
 * Invalidation: gwQueryKeys.financialCountdown + gwQueryKeys.financialEvents
 * No fallback صامت في write عند mode=supabase — explicit error toast.
 */
import { useState } from "react";
import { useSearch } from "wouter";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useGatewayFinancialCountdown, gwQueryKeys } from "@/hooks/useGatewayData";
import {
  gwCreateFinancialEvent,
  gwUpdateFinancialEvent,
  gwDeleteFinancialEvent,
} from "@/lib/dataGateway";
import {
  Plus, Copy, Loader2, Wallet, Receipt, Calculator,
  Trash2, Edit2, Info, Search, BarChart3,
  TrendingUp, HandCoins, AlertCircle, Clock
} from "lucide-react";

const TYPES = [
  { value: "salary", label: "راتب" },
  { value: "support", label: "دعم" },
  { value: "bill", label: "فاتورة/التزام" },
  { value: "other", label: "أخرى" },
];

function typeLabel(type: string) {
  return TYPES.find(t => t.value === type)?.label ?? type;
}

function accentForType(type: string) {
  if (type === "salary") return "hsl(var(--primary))";
  if (type === "bill") return "hsl(var(--destructive))";
  if (type === "support") return "hsl(43 90% 45%)";
  return "hsl(var(--accent))";
}

const DISCLAIMER = "هذه نتيجة تقديرية وليست فتوى مالية أو قانونية.";

function calcEndOfService(startDate: string, endDate: string, salary: number) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return null;
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  let entitlement = 0;
  if (years <= 5) {
    entitlement = salary * 0.5 * years;
  } else {
    entitlement = salary * 0.5 * 5 + salary * 1 * (years - 5);
  }
  return { years: parseFloat(years.toFixed(2)), entitlement: parseFloat(entitlement.toFixed(2)) };
}

function calcAgeDiff(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) { months--; days += 30; }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

function calcDateDiff(d1: string, d2: string) {
  const a = new Date(d1);
  const b = new Date(d2);
  const diffMs = Math.abs(b.getTime() - a.getTime());
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;
  return { years, months, days, totalDays };
}

// Asia/Riyadh "today" as a local-midnight Date (date boundaries follow KSA).
function riyadhToday(): Date {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const MONTH_NAMES_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

// Build the salary schedule for the current month + next 11 months from a
// salary event's day-of-month. Dates follow Asia/Riyadh; the first occurrence
// that is >= today is flagged as the upcoming payment.
function buildSalarySchedule(dayOfMonth: number, amount: number | null) {
  const today = riyadhToday();
  const clampDay = (yy: number, mm: number, dd: number) => Math.min(dd, new Date(yy, mm, 0).getDate());
  // Always start from the current month (even if this month's payday already
  // passed — it is shown as "صُرف"), then append the next 11 months.
  const baseYear = today.getFullYear();
  const baseMonth = today.getMonth();
  let nextFlagged = false;
  return Array.from({ length: 12 }, (_, i) => {
    let y = baseYear;
    let m = baseMonth + i;
    while (m > 11) { m -= 12; y += 1; }
    const date = new Date(y, m, clampDay(y, m + 1, dayOfMonth));
    const daysRemaining = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isNext = !nextFlagged && daysRemaining >= 0;
    if (isNext) nextFlagged = true;
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(m + 1).padStart(2, "0");
    return {
      key: `${y}-${mm}-${dd}`,
      monthLabel: `${MONTH_NAMES_AR[m]} ${y}`,
      dateLabel: `${dd}/${mm}`,
      daysRemaining,
      amount,
      isNext,
    };
  });
}

function SalarySchedule({ dayOfMonth, amount }: { dayOfMonth: number; amount: number | null }) {
  const months = buildSalarySchedule(dayOfMonth, amount);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
        border: "1px solid hsl(38 55% 75% / 0.55)",
        boxShadow: "0 3px 14px -3px rgba(80,40,10,0.15)",
      }}
    >
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
        <h3 className="font-extrabold text-sm text-foreground">جدول الراتب — 12 شهراً</h3>
      </div>
      <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {months.map(mo => (
          <div
            key={mo.key}
            className="rounded-xl p-2.5 flex flex-col gap-0.5"
            style={{
              background: mo.isNext ? "linear-gradient(135deg, hsl(38 72% 52% / 0.16), hsl(38 72% 52% / 0.06))" : "rgba(120,72,20,0.04)",
              border: mo.isNext ? "1.5px solid hsl(38 72% 52% / 0.5)" : "1px solid hsl(38 45% 70% / 0.35)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground">{mo.monthLabel}</span>
              {mo.isNext && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: "hsl(var(--primary))", color: "#fff" }}>
                  القادم
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] text-muted-foreground dir-ltr">{mo.dateLabel}</span>
              <span className="text-[10px] font-semibold" style={{ color: "hsl(38 55% 45%)" }}>
                {mo.daysRemaining > 0 ? `بعد ${mo.daysRemaining} يوم` : mo.daysRemaining === 0 ? "اليوم" : "صُرف"}
              </span>
            </div>
            {mo.amount != null && mo.amount > 0 && (
              <div className="text-[11px] font-extrabold mt-0.5" style={{ color: "hsl(var(--primary))" }}>
                {mo.amount.toLocaleString("ar-SA")}
                <span className="text-[8px] font-semibold mr-1 opacity-75">ريال</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function typeIcon(type: string, accent: string, size = "w-4 h-4") {
  if (type === "salary") return <TrendingUp className={size} style={{ color: accent }} />;
  if (type === "support") return <HandCoins className={size} style={{ color: accent }} />;
  if (type === "bill") return <AlertCircle className={size} style={{ color: accent }} />;
  return <Wallet className={size} style={{ color: accent }} />;
}

function EventCard({ item, onEdit, onDelete }: {
  item: { id: number; name: string; type: string; next_date: string; days_remaining: number; amount?: number | null };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const accent = accentForType(item.type);
  const isUrgent = item.days_remaining <= 3;
  const isSoon = item.days_remaining <= 7 && !isUrgent;
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
        border: "1px solid hsl(38 55% 75% / 0.55)",
        boxShadow: "0 3px 14px -3px rgba(80,40,10,0.15), 0 1px 0 rgba(255,225,150,0.22) inset",
        borderRight: `5px solid ${accent}`,
      }}
    >
      <div className="p-4 flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accent}22 0%, ${accent}0d 100%)`,
                border: `1.5px solid ${accent}40`,
                boxShadow: `0 2px 6px ${accent}20`,
              }}
            >
              {typeIcon(item.type, accent)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-[15px] text-foreground truncate leading-tight">{item.name}</h4>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5"
                style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
              >
                {typeLabel(item.type)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mr-11 mt-1">
            <Clock className="w-3 h-3" style={{ color: "hsl(38 55% 55%)" }} />
            <span className="text-xs text-muted-foreground">
              {item.next_date}
            </span>
          </div>
          {item.amount != null && item.amount > 0 && (
            <div
              className="mr-11 mt-1.5 text-[13px] font-extrabold"
              style={{ color: accent }}
            >
              {item.amount.toLocaleString("ar-SA")}
              <span className="text-[10px] font-semibold mr-1 opacity-75">ريال</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
            style={{
              background: isUrgent
                ? "linear-gradient(145deg, hsl(10 70% 52%) 0%, hsl(10 60% 44%) 100%)"
                : isSoon
                  ? "linear-gradient(145deg, hsl(38 80% 52%) 0%, hsl(38 70% 44%) 100%)"
                  : "linear-gradient(145deg, hsl(22 62% 22%) 0%, hsl(18 68% 18%) 100%)",
              boxShadow: isUrgent
                ? "0 3px 10px hsl(10 70% 52% / 0.35)"
                : isSoon
                  ? "0 3px 10px hsl(38 80% 52% / 0.30)"
                  : "0 3px 10px rgba(80,40,10,0.28)",
              border: "1.5px solid rgba(255,220,120,0.25)",
            }}
          >
            <span
              className="text-2xl font-extrabold leading-none"
              style={{ color: isUrgent || isSoon ? "#fff" : "hsl(38 82% 72%)" }}
            >
              {item.days_remaining}
            </span>
            <span
              className="text-[8px] font-bold mt-0.5"
              style={{ color: isUrgent || isSoon ? "rgba(255,255,255,0.8)" : "hsl(38 55% 58%)" }}
            >
              يوم
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: "hsl(38 72% 52% / 0.12)",
                border: "1px solid hsl(38 72% 52% / 0.25)",
                color: "hsl(var(--primary))",
              }}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 text-destructive"
              style={{
                background: "hsl(var(--destructive)/0.08)",
                border: "1px solid hsl(var(--destructive)/0.2)",
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalcCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(36 28% 91%) 100%)",
        border: "1px solid hsl(var(--card-border))",
        boxShadow: "0 2px 10px -2px rgba(80,40,10,0.13), 0 1px 0 rgba(255,225,170,0.16) inset",
      }}
    >
      <div className="px-5 pt-5 pb-3 flex items-center gap-2 border-b" style={{ borderColor: "hsl(var(--border)/0.5)" }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(var(--primary)/0.12)", border: "1px solid hsl(var(--primary)/0.25)" }}
        >
          <Calculator className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <h3 className="font-extrabold text-base text-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function ResultBox({ label, value, onCopy }: { label: string; value: string; onCopy?: () => void }) {
  return (
    <div
      className="p-4 rounded-xl flex items-center justify-between"
      style={{
        background: "linear-gradient(135deg, hsl(var(--primary)/0.12), hsl(var(--accent)/0.08))",
        border: "1px solid hsl(var(--primary)/0.3)",
      }}
    >
      <div>
        <div className="text-xs text-muted-foreground font-semibold mb-1">{label}</div>
        <div className="text-xl font-extrabold" style={{ color: "hsl(var(--primary))" }}>{value}</div>
      </div>
      {onCopy && (
        <Button variant="ghost" size="icon" onClick={onCopy} className="rounded-xl" style={{ color: "hsl(var(--primary))" }}>
          <Copy className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

function DisclaimerNote() {
  return (
    <div
      className="flex items-start gap-2 p-3 rounded-xl text-xs text-muted-foreground"
      style={{ background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border)/0.5)" }}
    >
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "hsl(var(--primary)/0.7)" }} />
      <span>{DISCLAIMER}</span>
    </div>
  );
}

function EventFormFields({
  name, setName, type, setType, nextDate, setNextDate, amount, setAmount, notes, setNotes
}: {
  name: string; setName: (v: string) => void;
  type: string; setType: (v: string) => void;
  nextDate: string; setNextDate: (v: string) => void;
  amount: string; setAmount: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>الاسم</Label>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: الراتب الشهري" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>النوع</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="rtl">
              {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>التاريخ</Label>
          <Input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>المبلغ (ريال) — اختياري</Label>
        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label>ملاحظات — اختيارية</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="أي تفاصيل إضافية..." />
      </div>
    </>
  );
}

export default function FinancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const search = useSearch();
  const urlTab = new URLSearchParams(search).get("tab");
  const validTabs = ["events", "calculators", "scale"];
  const initialTab = urlTab && validTabs.includes(urlTab) ? urlTab : "events";

  const { data: countdownData, isLoading } = useGatewayFinancialCountdown();

  const [isAddPending, setIsAddPending] = useState(false);
  const [isEditPending, setIsEditPending] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.financialCountdown });
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.financialEvents });
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("bill");
  const [nextDate, setNextDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => { setName(""); setType("bill"); setNextDate(new Date().toISOString().split("T")[0]); setAmount(""); setNotes(""); };

  const handleAdd = async () => {
    if (!name || !nextDate) { toast({ title: "خطأ", description: "الرجاء إدخال الاسم والتاريخ", variant: "destructive" }); return; }
    setIsAddPending(true);
    const result = await gwCreateFinancialEvent({
      name, type, next_date: nextDate,
      amount: amount ? parseFloat(amount) : null,
      notes: notes || null,
      is_active: true,
    });
    setIsAddPending(false);
    if (result.success) {
      toast({ title: "تمت الإضافة" });
      setIsAddOpen(false);
      resetForm();
      invalidate();
    } else {
      toast({ title: "خطأ", description: result.error ?? "فشل الحفظ", variant: "destructive" });
    }
  };

  const openEdit = (item: { id: number; name: string; type: string; next_date: string; amount?: number | null }) => {
    setEditId(item.id);
    setName(item.name);
    setType(item.type);
    setNextDate(item.next_date);
    setAmount(item.amount != null && item.amount > 0 ? String(item.amount) : "");
    setNotes("");
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editId) return;
    setIsEditPending(true);
    const result = await gwUpdateFinancialEvent(editId, {
      name, type, next_date: nextDate,
      amount: amount ? parseFloat(amount) : null,
      notes: notes || null,
    });
    setIsEditPending(false);
    if (result.success) {
      toast({ title: "تم التعديل" });
      setIsEditOpen(false);
      resetForm();
      invalidate();
    } else {
      toast({ title: "خطأ", description: result.error ?? "فشل التعديل", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await gwDeleteFinancialEvent(deleteId);
    if (result.success) {
      toast({ title: "تم الحذف" });
      setDeleteId(null);
      setIsEditOpen(false);
      invalidate();
    } else {
      toast({ title: "خطأ", description: result.error ?? "فشل الحذف", variant: "destructive" });
    }
  };

  const copyText = (val: string) => { navigator.clipboard.writeText(val); toast({ title: "تم النسخ" }); };

  const [basicSalary, setBasicSalary] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");
  const [netSalary, setNetSalary] = useState<number | null>(null);
  const calcSalary = () => {
    const basic = parseFloat(basicSalary) || 0;
    const allow = parseFloat(allowances) || 0;
    const deduct = parseFloat(deductions) || 0;
    const gosi = basic * 0.09;
    setNetSalary(Math.max(0, basic + allow - deduct - gosi));
  };

  const [birthDate, setBirthDate] = useState("");
  const [ageResult, setAgeResult] = useState<{ years: number; months: number; days: number } | null>(null);
  const calcAge = () => {
    if (!birthDate) return;
    setAgeResult(calcAgeDiff(birthDate));
  };

  const [dateA, setDateA] = useState("");
  const [dateB, setDateB] = useState("");
  const [diffResult, setDiffResult] = useState<{ years: number; months: number; days: number; totalDays: number } | null>(null);
  const calcDiff = () => {
    if (!dateA || !dateB) return;
    setDiffResult(calcDateDiff(dateA, dateB));
  };

  const [income, setIncome] = useState("");
  const [obligations, setObligations] = useState("");
  const [obligResult, setObligResult] = useState<{ remainder: number; pct: number } | null>(null);
  const calcObligations = () => {
    const inc = parseFloat(income) || 0;
    const obl = parseFloat(obligations) || 0;
    if (inc <= 0) return;
    setObligResult({ remainder: inc - obl, pct: parseFloat(((obl / inc) * 100).toFixed(1)) });
  };

  const [eosStart, setEosStart] = useState("");
  const [eosEnd, setEosEnd] = useState("");
  const [eosSalary, setEosSalary] = useState("");
  const [eosResult, setEosResult] = useState<{ years: number; entitlement: number } | null>(null);
  const calcEos = () => {
    if (!eosStart || !eosEnd || !eosSalary) return;
    setEosResult(calcEndOfService(eosStart, eosEnd, parseFloat(eosSalary) || 0));
  };

  const [scaleSearch, setScaleSearch] = useState("");
  const [activeScale, setActiveScale] = useState("civil");

  return (
    <AppShell title="المال والالتزامات">
      <Tabs defaultValue={initialTab} className="space-y-4">
        <TabsList
          className="w-full grid grid-cols-3 h-12 rounded-2xl p-1"
          style={{
            background: "linear-gradient(135deg, hsl(22 62% 16%) 0%, hsl(18 68% 12%) 100%)",
            border: "1.5px solid hsl(38 55% 38% / 0.45)",
            boxShadow: "0 3px 12px -2px rgba(80,40,10,0.25), 0 1px 0 rgba(255,220,100,0.10) inset",
          }}
        >
          <TabsTrigger
            value="events"
            className="font-bold text-xs rounded-xl data-[state=active]:shadow-md"
            style={{ color: "hsl(38 55% 68%)" }}
          >
            المواعيد
          </TabsTrigger>
          <TabsTrigger
            value="calculators"
            className="font-bold text-xs rounded-xl data-[state=active]:shadow-md"
            style={{ color: "hsl(38 55% 68%)" }}
          >
            الحاسبات
          </TabsTrigger>
          <TabsTrigger
            value="scale"
            className="font-bold text-xs rounded-xl data-[state=active]:shadow-md"
            style={{ color: "hsl(38 55% 68%)" }}
          >
            سلم الرواتب
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-3">
          {/* ─── Financial Summary Header ──────────────────────────── */}
          {!isLoading && countdownData && countdownData.length > 0 && (() => {
            const monthNow = new Date().toLocaleDateString("ar-SA-u-ca-gregory", { month: "long", year: "numeric" });
            const salaryItems = countdownData.filter(e => e.type === "salary");
            const supportItems = countdownData.filter(e => e.type === "support");
            const billItems = countdownData.filter(e => e.type === "bill");
            const salaryTotal = salaryItems.reduce((s, e) => s + (Number(e.amount) || 0), 0);
            const supportTotal = supportItems.reduce((s, e) => s + (Number(e.amount) || 0), 0);
            const billsTotal = billItems.reduce((s, e) => s + (Number(e.amount) || 0), 0);
            const netTotal = salaryTotal + supportTotal - billsTotal;
            const stats = [
              { label: "الرواتب", total: salaryTotal, count: salaryItems.length, color: "hsl(38 72% 58%)", borderColor: "hsl(38 72% 52%)", icon: TrendingUp },
              { label: "الدعم", total: supportTotal, count: supportItems.length, color: "hsl(43 88% 56%)", borderColor: "hsl(43 88% 45%)", icon: HandCoins },
              { label: "الفواتير", total: billsTotal, count: billItems.length, color: "hsl(10 65% 62%)", borderColor: "hsl(10 65% 52%)", icon: AlertCircle },
            ];
            return (
              <div
                className="-mx-3 px-4 pt-4 pb-3 mb-1"
                style={{
                  background: "linear-gradient(160deg, hsl(22 72% 16%) 0%, hsl(16 72% 12%) 60%, hsl(22 62% 14%) 100%)",
                  borderBottom: "1.5px solid hsl(38 65% 38% / 0.5)",
                  borderTop: "1px solid hsl(38 65% 32% / 0.3)",
                }}
              >
                {/* Top row: title + month + net */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-5 rounded-full"
                      style={{ background: "linear-gradient(180deg, hsl(38 82% 62%), hsl(38 60% 42%))" }}
                    />
                    <span className="text-[14px] font-extrabold tracking-wide" style={{ color: "hsl(38 85% 82%)" }}>
                      ملخص مالي
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold" style={{ color: "hsl(38 50% 55%)" }}>{monthNow}</div>
                    <div className="text-[11px] font-extrabold" style={{ color: netTotal >= 0 ? "hsl(38 82% 68%)" : "hsl(10 65% 62%)" }}>
                      صافي: {netTotal.toLocaleString("ar-SA")} ريال
                    </div>
                  </div>
                </div>
                {/* Ornament divider */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(38 55% 42% / 0.5))" }} />
                  <div className="w-1.5 h-1.5 rotate-45" style={{ background: "hsl(38 72% 55%)" }} />
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, hsl(38 55% 42% / 0.5), transparent)" }} />
                </div>
                {/* 3 stat cards */}
                <div className="grid grid-cols-3 gap-2">
                  {stats.map(s => {
                    const Icon = s.icon;
                    return (
                      <div
                        key={s.label}
                        className="rounded-xl p-3 text-center flex flex-col items-center gap-1"
                        style={{
                          background: "rgba(255,255,255,0.055)",
                          border: `1px solid ${s.borderColor}35`,
                          boxShadow: `0 2px 8px ${s.borderColor}15 inset`,
                        }}
                      >
                        <Icon className="w-4 h-4 mb-0.5" style={{ color: s.color }} />
                        <div className="text-[10px] font-bold" style={{ color: "hsl(38 50% 65%)" }}>
                          {s.label}
                        </div>
                        <div className="text-[15px] font-extrabold leading-tight" style={{ color: s.color }}>
                          {s.total > 0 ? s.total.toLocaleString("ar-SA") : "—"}
                        </div>
                        {s.total > 0 && (
                          <div className="text-[8px] font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>
                            ريال ({s.count} حدث)
                          </div>
                        )}
                        {s.total === 0 && s.count === 0 && (
                          <div className="text-[8px]" style={{ color: "rgba(255,255,255,0.28)" }}>لا يوجد</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {!isLoading && countdownData && (() => {
            const salary = countdownData.find(e => e.type === "salary");
            if (!salary) return null;
            const day = parseInt(String(salary.next_date).slice(8, 10), 10);
            if (!day || Number.isNaN(day)) return null;
            return <SalarySchedule dayOfMonth={day} amount={salary.amount ?? null} />;
          })()}

          <div className="flex justify-between items-center">
            <div className="text-xs font-semibold" style={{ color: "hsl(38 55% 50%)" }}>
              {!isLoading && countdownData && countdownData.length > 0
                ? `${countdownData.length} حدث مالي`
                : ""}
            </div>
            <Dialog open={isAddOpen} onOpenChange={v => { setIsAddOpen(v); if (!v) resetForm(); }}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="font-bold rounded-xl gap-1.5"
                  style={{
                    background: "linear-gradient(135deg, hsl(38 72% 52%) 0%, hsl(32 68% 44%) 100%)",
                    boxShadow: "0 3px 10px hsl(38 72% 52% / 0.35)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  إضافة حدث مالي
                </Button>
              </DialogTrigger>
              <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>حدث مالي جديد</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <EventFormFields
                    name={name} setName={setName}
                    type={type} setType={setType}
                    nextDate={nextDate} setNextDate={setNextDate}
                    amount={amount} setAmount={setAmount}
                    notes={notes} setNotes={setNotes}
                  />
                  <Button className="w-full" onClick={handleAdd} disabled={isAddPending}>
                    {isAddPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ الحدث"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3 pt-2">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className="rounded-2xl p-4 flex gap-3 items-start animate-pulse"
                  style={{
                    background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
                    border: "1px solid hsl(38 55% 75% / 0.4)",
                    borderRight: "5px solid hsl(38 55% 75% / 0.4)",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: "hsl(38 35% 85%)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded-lg w-2/3" style={{ background: "hsl(38 35% 85%)" }} />
                    <div className="h-3 rounded-lg w-1/3" style={{ background: "hsl(38 30% 88%)" }} />
                  </div>
                  <div className="w-14 h-14 rounded-2xl shrink-0" style={{ background: "hsl(38 35% 82%)" }} />
                </div>
              ))}
            </div>
          ) : countdownData && countdownData.length > 0 ? (
            <div className="space-y-3">
              {countdownData.map(item => (
                <EventCard
                  key={item.id}
                  item={item}
                  onEdit={() => openEdit(item)}
                  onDelete={() => { setDeleteId(item.id); setIsDeleteOpen(true); }}
                />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-14 rounded-2xl flex flex-col items-center gap-3"
              style={{
                background: "linear-gradient(145deg, #FFFBF4 0%, hsl(36 28% 93%) 100%)",
                border: "1.5px dashed hsl(38 55% 65% / 0.55)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(145deg, hsl(22 62% 22%), hsl(18 68% 18%))",
                  boxShadow: "0 4px 14px rgba(80,40,10,0.2)",
                  border: "1.5px solid hsl(38 55% 40% / 0.4)",
                }}
              >
                <Wallet className="w-8 h-8" style={{ color: "hsl(38 72% 62%)" }} />
              </div>
              <div>
                <p className="text-base font-extrabold" style={{ color: "hsl(22 62% 22%)" }}>لا توجد أحداث مالية</p>
                <p className="text-sm mt-1" style={{ color: "hsl(38 30% 52%)" }}>اضغط إضافة لإنشاء حدث مالي جديد</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calculators" className="space-y-5">
          <CalcCard title="حاسبة الراتب الصافي">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">الراتب الأساسي (ريال)</Label>
              <Input type="number" value={basicSalary} onChange={e => setBasicSalary(e.target.value)} placeholder="مثال: 10000" className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">البدلات</Label>
                <Input type="number" value={allowances} onChange={e => setAllowances(e.target.value)} placeholder="0" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">خصومات أخرى</Label>
                <Input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} placeholder="0" className="rounded-xl" />
              </div>
            </div>
            <Button className="w-full font-bold h-11 rounded-xl" onClick={calcSalary}>احسب الراتب الصافي</Button>
            {netSalary !== null && (
              <>
                <ResultBox
                  label="الصافي التقديري (بعد خصم 9% التأمينات):"
                  value={`${netSalary.toFixed(2)} ريال`}
                  onCopy={() => copyText(netSalary.toFixed(2))}
                />
                <DisclaimerNote />
              </>
            )}
          </CalcCard>

          <CalcCard title="حاسبة العمر">
            <div className="space-y-2">
              <Label className="font-semibold text-sm">تاريخ الميلاد</Label>
              <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="rounded-xl" />
            </div>
            <Button className="w-full font-bold h-11 rounded-xl" onClick={calcAge} disabled={!birthDate}>احسب العمر</Button>
            {ageResult && (
              <ResultBox
                label="عمرك الحالي:"
                value={`${ageResult.years} سنة، ${ageResult.months} شهر، ${ageResult.days} يوم`}
                onCopy={() => copyText(`${ageResult.years} سنة، ${ageResult.months} شهر، ${ageResult.days} يوم`)}
              />
            )}
          </CalcCard>

          <CalcCard title="حاسبة الفرق بين تاريخين">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">تاريخ البداية</Label>
                <Input type="date" value={dateA} onChange={e => setDateA(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">تاريخ النهاية</Label>
                <Input type="date" value={dateB} onChange={e => setDateB(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <Button className="w-full font-bold h-11 rounded-xl" onClick={calcDiff} disabled={!dateA || !dateB}>احسب الفرق</Button>
            {diffResult && (
              <ResultBox
                label="الفرق بين التاريخين:"
                value={`${diffResult.years} سنة، ${diffResult.months} شهر، ${diffResult.days} يوم (${diffResult.totalDays} يوم إجمالاً)`}
                onCopy={() => copyText(`${diffResult.totalDays} يوم`)}
              />
            )}
          </CalcCard>

          <CalcCard title="حاسبة الالتزامات الشهرية">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">الدخل الشهري (ريال)</Label>
                <Input type="number" value={income} onChange={e => setIncome(e.target.value)} placeholder="0" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">إجمالي الالتزامات (ريال)</Label>
                <Input type="number" value={obligations} onChange={e => setObligations(e.target.value)} placeholder="0" className="rounded-xl" />
              </div>
            </div>
            <Button className="w-full font-bold h-11 rounded-xl" onClick={calcObligations} disabled={!income}>احسب المتبقي</Button>
            {obligResult && (
              <div className="space-y-3">
                <ResultBox
                  label="المتبقي بعد الالتزامات:"
                  value={`${obligResult.remainder.toFixed(2)} ريال`}
                  onCopy={() => copyText(obligResult.remainder.toFixed(2))}
                />
                <div
                  className="p-3 rounded-xl text-center"
                  style={{
                    background: obligResult.pct > 50 ? "hsl(var(--destructive)/0.08)" : "hsl(var(--primary)/0.08)",
                    border: `1px solid ${obligResult.pct > 50 ? "hsl(var(--destructive)/0.3)" : "hsl(var(--primary)/0.2)"}`,
                  }}
                >
                  <span className="font-bold text-lg" style={{ color: obligResult.pct > 50 ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}>
                    {obligResult.pct}%
                  </span>
                  <span className="text-sm text-muted-foreground mr-2">نسبة الالتزامات من الدخل</span>
                </div>
              </div>
            )}
          </CalcCard>

          <CalcCard title="حاسبة نهاية الخدمة">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-sm">تاريخ بداية العمل</Label>
                <Input type="date" value={eosStart} onChange={e => setEosStart(e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-sm">تاريخ نهاية العمل</Label>
                <Input type="date" value={eosEnd} onChange={e => setEosEnd(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold text-sm">الراتب الأساسي (ريال)</Label>
              <Input type="number" value={eosSalary} onChange={e => setEosSalary(e.target.value)} placeholder="مثال: 10000" className="rounded-xl" />
            </div>
            <Button className="w-full font-bold h-11 rounded-xl" onClick={calcEos} disabled={!eosStart || !eosEnd || !eosSalary}>
              احسب مكافأة نهاية الخدمة
            </Button>
            {eosResult && (
              <>
                <div className="space-y-2">
                  <ResultBox
                    label="مدة الخدمة:"
                    value={`${eosResult.years} سنة`}
                  />
                  <ResultBox
                    label="المكافأة التقديرية (عند الإنهاء):"
                    value={`${eosResult.entitlement.toFixed(2)} ريال`}
                    onCopy={() => copyText(eosResult.entitlement.toFixed(2))}
                  />
                </div>
                <DisclaimerNote />
              </>
            )}
          </CalcCard>
        </TabsContent>

        <TabsContent value="scale" className="space-y-4">
          {(() => {
            const SCALES: Record<string, { label: string; color: string; grades: { grade: string; title: string; basic: number; housing: number; transport: number }[] }> = {
              civil: {
                label: "سلم الموظفين العام",
                color: "text-amber-700",
                grades: [
                  { grade: "الأولى",   title: "موظف ابتدائي",       basic: 3900,  housing: 1000, transport: 600 },
                  { grade: "الثانية",  title: "موظف",               basic: 4400,  housing: 1000, transport: 600 },
                  { grade: "الثالثة",  title: "مساعد أول",          basic: 5000,  housing: 1000, transport: 600 },
                  { grade: "الرابعة",  title: "مساعد",              basic: 5700,  housing: 1300, transport: 700 },
                  { grade: "الخامسة",  title: "مسؤول",              basic: 6500,  housing: 1300, transport: 700 },
                  { grade: "السادسة",  title: "مسؤول أول",          basic: 7400,  housing: 1500, transport: 800 },
                  { grade: "السابعة",  title: "متخصص",             basic: 8500,  housing: 1500, transport: 800 },
                  { grade: "الثامنة",  title: "متخصص أول",         basic: 9800,  housing: 2000, transport: 1000 },
                  { grade: "التاسعة",  title: "خبير",               basic: 11300, housing: 2000, transport: 1000 },
                  { grade: "العاشرة",  title: "خبير أول",           basic: 13000, housing: 2500, transport: 1200 },
                  { grade: "الحادية عشرة", title: "مدير",          basic: 15000, housing: 2500, transport: 1200 },
                  { grade: "الثانية عشرة", title: "مدير عام مساعد", basic: 17500, housing: 3000, transport: 1500 },
                  { grade: "الثالثة عشرة", title: "مدير عام",      basic: 20500, housing: 3000, transport: 1500 },
                  { grade: "الرابعة عشرة", title: "وكيل مساعد",    basic: 24000, housing: 3500, transport: 1500 },
                  { grade: "الخامسة عشرة", title: "وكيل وزارة",    basic: 28000, housing: 3500, transport: 1500 },
                ],
              },
              teacher: {
                label: "سلم المعلمين",
                color: "text-emerald-700",
                grades: [
                  { grade: "الأولى",   title: "معلم مبتدئ",        basic: 4200,  housing: 1000, transport: 600 },
                  { grade: "الثانية",  title: "معلم",              basic: 4800,  housing: 1000, transport: 600 },
                  { grade: "الثالثة",  title: "معلم أول",          basic: 5500,  housing: 1000, transport: 600 },
                  { grade: "الرابعة",  title: "معلم متميز",        basic: 6300,  housing: 1300, transport: 700 },
                  { grade: "الخامسة",  title: "مشرف تربوي",        basic: 7200,  housing: 1300, transport: 700 },
                  { grade: "السادسة",  title: "مشرف أول",          basic: 8300,  housing: 1500, transport: 800 },
                  { grade: "السابعة",  title: "موجه تربوي",        basic: 9600,  housing: 1500, transport: 800 },
                  { grade: "الثامنة",  title: "رئيس قسم",          basic: 11000, housing: 2000, transport: 1000 },
                  { grade: "التاسعة",  title: "مدير مدرسة",        basic: 12800, housing: 2000, transport: 1000 },
                  { grade: "العاشرة",  title: "مدير إدارة تعليمية", basic: 15000, housing: 2500, transport: 1200 },
                ],
              },
              health: {
                label: "سلم الصحيين",
                color: "text-blue-700",
                grades: [
                  { grade: "الأولى",   title: "فني صحي",           basic: 4500,  housing: 1000, transport: 600 },
                  { grade: "الثانية",  title: "فني أول",           basic: 5200,  housing: 1000, transport: 600 },
                  { grade: "الثالثة",  title: "صيدلاني / ممرض",    basic: 6000,  housing: 1300, transport: 700 },
                  { grade: "الرابعة",  title: "طبيب مقيم",         basic: 7500,  housing: 1300, transport: 700 },
                  { grade: "الخامسة",  title: "طبيب عام",          basic: 9500,  housing: 1500, transport: 800 },
                  { grade: "السادسة",  title: "طبيب متخصص",        basic: 12000, housing: 2000, transport: 1000 },
                  { grade: "السابعة",  title: "استشاري",           basic: 16000, housing: 2500, transport: 1200 },
                  { grade: "الثامنة",  title: "رئيس قسم طبي",      basic: 20000, housing: 3000, transport: 1500 },
                  { grade: "التاسعة",  title: "مدير مستشفى",       basic: 25000, housing: 3500, transport: 1500 },
                ],
              },
              military: {
                label: "سلم العسكريين",
                color: "text-red-700",
                grades: [
                  { grade: "جندي",          title: "جندي",           basic: 4000,  housing: 1000, transport: 600 },
                  { grade: "عريف",          title: "عريف",           basic: 4500,  housing: 1000, transport: 600 },
                  { grade: "وكيل رقيب",     title: "وكيل رقيب",     basic: 5100,  housing: 1300, transport: 700 },
                  { grade: "رقيب",          title: "رقيب",           basic: 5800,  housing: 1300, transport: 700 },
                  { grade: "رقيب أول",      title: "رقيب أول",      basic: 6700,  housing: 1500, transport: 800 },
                  { grade: "ملازم ثانٍ",    title: "ملازم ثانٍ",    basic: 8000,  housing: 1500, transport: 800 },
                  { grade: "ملازم أول",     title: "ملازم أول",     basic: 9500,  housing: 2000, transport: 1000 },
                  { grade: "نقيب",          title: "نقيب",           basic: 11500, housing: 2000, transport: 1000 },
                  { grade: "رائد",          title: "رائد",           basic: 13500, housing: 2500, transport: 1200 },
                  { grade: "مقدم",          title: "مقدم",           basic: 16000, housing: 2500, transport: 1200 },
                  { grade: "عقيد",          title: "عقيد",           basic: 19000, housing: 3000, transport: 1500 },
                  { grade: "عميد",          title: "عميد",           basic: 23000, housing: 3000, transport: 1500 },
                  { grade: "لواء",          title: "لواء",           basic: 28000, housing: 3500, transport: 1500 },
                ],
              },
            };
            const scale = SCALES[activeScale];
            const filtered = scale.grades.filter(g =>
              !scaleSearch.trim() ||
              g.grade.includes(scaleSearch) ||
              g.title.includes(scaleSearch) ||
              String(g.basic).includes(scaleSearch)
            );
            return (
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(SCALES).map(([key, s]) => (
                    <button
                      key={key}
                      onClick={() => { setActiveScale(key); setScaleSearch(""); }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        activeScale === key
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    value={scaleSearch}
                    onChange={e => setScaleSearch(e.target.value)}
                    placeholder="بحث بالمرتبة أو المسمى..."
                    className="w-full h-11 rounded-xl border border-border bg-card pr-9 pl-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--card-border))",
                    boxShadow: "0 2px 10px -2px rgba(80,40,10,0.10)",
                  }}
                >
                  <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: "hsl(var(--border)/0.5)" }}>
                    <BarChart3 className={`w-5 h-5 ${scale.color}`} />
                    <h3 className={`font-extrabold text-base ${scale.color}`}>{scale.label}</h3>
                    <span className="text-xs text-muted-foreground mr-auto">{filtered.length} مرتبة</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground font-semibold" style={{ borderColor: "hsl(var(--border)/0.5)", background: "hsl(var(--muted)/0.4)" }}>
                          <th className="px-4 py-2.5 text-right">المرتبة</th>
                          <th className="px-4 py-2.5 text-right">المسمى</th>
                          <th className="px-4 py-2.5 text-left">الأساسي</th>
                          <th className="px-4 py-2.5 text-left">السكن</th>
                          <th className="px-4 py-2.5 text-left">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((g, i) => {
                          const total = g.basic + g.housing + g.transport;
                          return (
                            <tr
                              key={g.grade}
                              className="border-b transition-colors hover:bg-muted/30"
                              style={{ borderColor: "hsl(var(--border)/0.3)", background: i % 2 === 0 ? "transparent" : "hsl(var(--muted)/0.15)" }}
                            >
                              <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{g.grade}</td>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{g.title}</td>
                              <td className="px-4 py-3 text-left font-medium text-foreground whitespace-nowrap" dir="ltr">{g.basic.toLocaleString()}</td>
                              <td className="px-4 py-3 text-left text-muted-foreground whitespace-nowrap" dir="ltr">{g.housing.toLocaleString()}</td>
                              <td className="px-4 py-3 text-left font-bold whitespace-nowrap" style={{ color: "hsl(var(--primary))" }} dir="ltr">{total.toLocaleString()} ريال</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-xs text-muted-foreground"
                  style={{ background: "hsl(var(--muted)/0.4)", border: "1px solid hsl(var(--border)/0.5)" }}
                >
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "hsl(var(--primary)/0.7)" }} />
                  <span>بيانات تجريبية تقديرية — قد تختلف الأرقام الرسمية. يُنصح بمراجعة وزارة الموارد البشرية.</span>
                </div>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={v => { setIsEditOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>تعديل الحدث المالي</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <EventFormFields
              name={name} setName={setName}
              type={type} setType={setType}
              nextDate={nextDate} setNextDate={setNextDate}
              amount={amount} setAmount={setAmount}
              notes={notes} setNotes={setNotes}
            />
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleEdit} disabled={isEditPending}>
                {isEditPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التعديلات"}
              </Button>
              <Button variant="destructive" size="icon" onClick={() => { setDeleteId(editId); setIsDeleteOpen(true); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="حذف الحدث المالي"
        description="هل أنت متأكد من حذف هذا الحدث المالي؟ لا يمكن التراجع عن هذا الإجراء."
        onConfirm={handleDelete}
      />
    </AppShell>
  );
}
