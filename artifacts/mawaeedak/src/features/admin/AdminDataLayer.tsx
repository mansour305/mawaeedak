import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Database, CheckCircle2, XCircle, AlertCircle, RefreshCw, PenLine
} from "lucide-react";
import {
  gwRunShadowComparison,
  gwMarkNotificationRead,
  gwMarkAllNotificationsRead,
  DATA_SOURCE_MODE,
} from "@/lib/dataGateway";
import type { ShadowComparisonSummary, WriteResult } from "@/lib/dataGateway";

const TABLE_LABELS: Record<string, string> = {
  daily_messages: "رسائل اليوم",
  story_templates: "قوالب الستوري",
  themes: "الثيمات",
  news: "الأخبار",
  jobs: "الوظائف",
  appointments: "المواعيد",
  financial_events: "الأحداث المالية",
  notifications: "الإشعارات",
  complaints: "الشكاوى",
};

const MODE_LABEL: Record<string, string> = {
  api: "API / PostgreSQL",
  supabase_shadow: "Shadow — API + Supabase مقارنة",
  supabase: "Supabase",
};

// جرد كامل للـ mutations — Phase 12I
const MUTATIONS_INVENTORY = [
  { scope: "notifications — mark-read", risk: "low", mode: "supabase", phase: "12I", note: "Write Gateway جاهز — اختبار هنا" },
  { scope: "notifications — mark-all-read", risk: "low", mode: "supabase", phase: "12I", note: "Write Gateway جاهز — اختبار هنا" },
  { scope: "notifications — delete", risk: "medium", mode: "api", phase: "12J", note: "يبقى على Orval" },
  { scope: "news — add/edit/delete (admin)", risk: "medium", mode: "api", phase: "12J", note: "يبقى على Orval" },
  { scope: "jobs — add/edit/delete (admin)", risk: "medium", mode: "api", phase: "12J", note: "يبقى على Orval" },
  { scope: "story_templates — add/edit/delete (admin)", risk: "medium", mode: "api", phase: "12J", note: "يبقى على Orval" },
  { scope: "daily_messages — add/edit/delete (admin)", risk: "medium", mode: "api", phase: "12J", note: "يبقى على Orval" },
  { scope: "themes — update/toggle (admin)", risk: "low", mode: "api", phase: "12J", note: "يبقى على Orval" },
  { scope: "appointments — add/edit/delete", risk: "high", mode: "api", phase: "later", note: "ممنوع هذه المرحلة — يؤثر على الرئيسية" },
  { scope: "financial_events — add/edit/delete", risk: "high", mode: "api", phase: "later", note: "ممنوع هذه المرحلة — يؤثر على الرئيسية" },
  { scope: "complaints — create", risk: "low", mode: "api", phase: "12J", note: "يبقى على Orval" },
  { scope: "admin notifications — create/delete", risk: "medium", mode: "api", phase: "12J", note: "يبقى على Orval" },
];

const RISK_COLORS: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export default function AdminDataLayer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShadowComparisonSummary | null>(null);

  // Write test state
  const [writeLoading, setWriteLoading] = useState(false);
  const [writeResult, setWriteResult] = useState<WriteResult & { action?: string } | null>(null);

  const runComparison = async () => {
    setLoading(true);
    try {
      const summary = await gwRunShadowComparison();
      setResult(summary);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const testMarkRead = async () => {
    setWriteLoading(true);
    setWriteResult(null);
    try {
      // نختبر على الإشعار id=1 (legacy_id=1 في Supabase)
      const r = await gwMarkNotificationRead(1);
      setWriteResult({ ...r, action: "mark-read (id=1)" });
    } finally {
      setWriteLoading(false);
    }
  };

  const testMarkAllRead = async () => {
    setWriteLoading(true);
    setWriteResult(null);
    try {
      const r = await gwMarkAllNotificationsRead();
      setWriteResult({ ...r, action: "mark-all-read" });
    } finally {
      setWriteLoading(false);
    }
  };

  const currentMode = DATA_SOURCE_MODE;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">طبقة البيانات — Data Layer</h2>

      {/* حالة المصدر */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            حالة المصدر الحالي
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">وضع البيانات</span>
            <Badge variant={currentMode === "supabase" ? "default" : "secondary"}>
              {MODE_LABEL[currentMode] ?? currentMode}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">مصدر القراءة</span>
            <span className="font-medium">
              {currentMode === "supabase"
                ? "Supabase (مع fallback إلى API)"
                : currentMode === "supabase_shadow"
                  ? "API + Supabase (مقارنة)"
                  : "API / PostgreSQL"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">مصدر الكتابة</span>
            <span className="font-medium">
              {currentMode === "supabase"
                ? "Supabase (notifications mark-read) + API (بقية mutations)"
                : "API / PostgreSQL (كل الكتابة)"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Supabase Auth</span>
            <Badge variant="outline" className="text-emerald-600 border-emerald-300">فعّال</Badge>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-blue-800 text-xs leading-relaxed">
            <strong>Phase 12I:</strong> Partial Write Cutover — notifications mark-read جاهز لـ Supabase (mode=supabase فقط).
            بقية الكتابة: API. NotificationsPage تبقى على Orval — Phase 12J.
          </div>
        </CardContent>
      </Card>

      {/* اختبار الكتابة — Write Gateway Test */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary" />
            اختبار Write Gateway — Phase 12I
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground leading-relaxed">
            <strong>النطاق المختار:</strong> notifications mark-read<br />
            <strong>الوضع الحالي:</strong> {MODE_LABEL[currentMode] ?? currentMode}<br />
            <strong>ماذا سيحدث:</strong>{" "}
            {currentMode === "supabase"
              ? "سيكتب إلى Supabase مباشرة (UPDATE is_read=true WHERE legacy_id=1)"
              : "سيكتب عبر API (PATCH /api/notifications/1) — Supabase غير متأثر"}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={testMarkRead}
              disabled={writeLoading}
            >
              {writeLoading
                ? <Loader2 className="w-4 h-4 animate-spin ml-1" />
                : <CheckCircle2 className="w-4 h-4 ml-1 text-emerald-600" />}
              mark-read (id=1)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={testMarkAllRead}
              disabled={writeLoading}
            >
              {writeLoading
                ? <Loader2 className="w-4 h-4 animate-spin ml-1" />
                : <CheckCircle2 className="w-4 h-4 ml-1 text-emerald-600" />}
              mark-all-read
            </Button>
          </div>

          {writeResult && (
            <div className={`rounded-lg p-3 text-sm border ${
              writeResult.success
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {writeResult.success
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <XCircle className="w-4 h-4" />}
                {writeResult.success ? "نجح الاختبار" : "فشل الاختبار"}
              </div>
              <div className="text-xs">
                <span className="text-muted-foreground">العملية: </span>
                {writeResult.action}
              </div>
              {writeResult.error && (
                <div className="text-xs mt-1 font-mono opacity-80">{writeResult.error}</div>
              )}
              {writeResult.success && currentMode === "supabase" && (
                <div className="text-xs mt-1 opacity-70">
                  تحقق: Supabase Dashboard → notifications → is_read = true للصف legacy_id=1
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* جرد الـ mutations */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">جرد Mutations — تصنيف الخطورة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden text-xs">
            <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 font-semibold text-muted-foreground">
              <span className="col-span-5">النطاق</span>
              <span className="col-span-2 text-center">خطورة</span>
              <span className="col-span-2 text-center">المرحلة</span>
              <span className="col-span-3">الملاحظة</span>
            </div>
            {MUTATIONS_INVENTORY.map((m) => (
              <div key={m.scope} className="grid grid-cols-12 px-3 py-2 items-center gap-1">
                <span className="col-span-5 text-foreground font-medium leading-tight">{m.scope}</span>
                <span className="col-span-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${RISK_COLORS[m.risk]}`}>
                    {m.risk === "low" ? "منخفض" : m.risk === "medium" ? "متوسط" : "عالي"}
                  </span>
                </span>
                <span className="col-span-2 text-center text-muted-foreground font-mono">{m.phase}</span>
                <span className="col-span-3 text-muted-foreground leading-tight">{m.note}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* مقارنة البيانات */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            مقارنة البيانات — API vs Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={runComparison} disabled={loading} size="sm" className="w-full">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin ml-2" />جارٍ المقارنة…</>
              : "تشغيل المقارنة"}
          </Button>

          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Supabase متصل؟</span>
                {result.supabaseConnected
                  ? <Badge variant="default" className="bg-emerald-600">متصل</Badge>
                  : <Badge variant="destructive">غير متصل</Badge>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API الإجمالي</span>
                <span className="font-bold">{result.apiTotal}</span>
              </div>
              {result.supabaseTotal !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Supabase الإجمالي</span>
                  <span className="font-bold">{result.supabaseTotal}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">النتيجة الكلية</span>
                {result.allMatch === true
                  ? <Badge className="bg-emerald-600"><CheckCircle2 className="w-3 h-3 ml-1" />مطابق تام</Badge>
                  : result.allMatch === false
                    ? <Badge variant="destructive"><XCircle className="w-3 h-3 ml-1" />يوجد اختلاف</Badge>
                    : <Badge variant="secondary"><AlertCircle className="w-3 h-3 ml-1" />غير محدد</Badge>}
              </div>

              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden text-sm">
                <div className="grid grid-cols-4 bg-muted/50 px-3 py-2 font-semibold text-xs text-muted-foreground">
                  <span className="col-span-2">الجدول</span>
                  <span className="text-center">API</span>
                  <span className="text-center">Supabase</span>
                </div>
                {result.results.map((row) => (
                  <div key={row.table} className="grid grid-cols-4 px-3 py-2 items-center">
                    <span className="col-span-2 text-foreground">{TABLE_LABELS[row.table] ?? row.table}</span>
                    <span className="text-center font-mono">{row.apiCount}</span>
                    <span className="text-center font-mono flex items-center justify-center gap-1">
                      {row.supabaseCount ?? "—"}
                      {row.match === true && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {row.match === false && <XCircle className="w-3 h-3 text-destructive" />}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                آخر تشغيل: {new Date(result.runAt).toLocaleString("ar-SA-u-ca-gregory")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* تغيير الوضع */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">تغيير الوضع (dev فقط)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>أضف متغير البيئة التالي لتغيير مصدر البيانات:</p>
          <div className="rounded-md bg-muted p-3 font-mono text-xs text-foreground space-y-1">
            <p>VITE_DATA_SOURCE_MODE=api              # PostgreSQL/Express (الافتراضي)</p>
            <p>VITE_DATA_SOURCE_MODE=supabase_shadow  # API + مقارنة Supabase</p>
            <p>VITE_DATA_SOURCE_MODE=supabase         # Supabase قراءة + mark-read كتابة</p>
          </div>
          <p className="text-xs">
            الافتراضي = api. في mode=supabase: mark-read يكتب إلى Supabase مباشرة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
