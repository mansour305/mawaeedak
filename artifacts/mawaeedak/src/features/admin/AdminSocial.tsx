import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useGetSocialSettings,
  useUpdateSocialSettings,
  useListSocialLogs,
  usePreviewSocialPost,
  useTestSocialPost,
  getGetSocialSettingsQueryKey,
  getListSocialLogsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Twitter, Loader2, Send, Eye, Save, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

const REQUIRED_SECRETS = ["X_CLIENT_ID", "X_CLIENT_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"];

export default function AdminSocial() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSocialSettings();
  const { data: logs } = useListSocialLogs();
  const updateSettings = useUpdateSocialSettings();
  const preview = usePreviewSocialPost();
  const test = useTestSocialPost();

  const [enabled, setEnabled] = useState(false);
  const [postTime, setPostTime] = useState("00:05");
  const [template, setTemplate] = useState("");
  const [handle, setHandle] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; missing?: string[] } | null>(null);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.is_enabled);
      setPostTime(settings.post_time);
      setTemplate(settings.template);
      setHandle(settings.account_handle ?? "");
    }
  }, [settings]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getGetSocialSettingsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListSocialLogsQueryKey() });
  };

  const handleSave = () => {
    updateSettings.mutate(
      { data: { is_enabled: enabled, post_time: postTime, template, account_handle: handle } },
      {
        onSuccess: () => { toast({ title: "تم حفظ الإعدادات" }); invalidate(); },
        onError: () => toast({ title: "خطأ", description: "تعذر الحفظ", variant: "destructive" }),
      }
    );
  };

  const handlePreview = () => {
    preview.mutate(undefined, {
      onSuccess: (r) => { setPreviewText(r.content); invalidate(); },
      onError: () => toast({ title: "خطأ", description: "تعذر إنشاء المعاينة", variant: "destructive" }),
    });
  };

  const handleTest = () => {
    test.mutate(undefined, {
      onSuccess: (r) => {
        setTestResult({ ok: r.ok, message: r.message, missing: r.missing_secrets });
        if (r.content) setPreviewText(r.content);
        invalidate();
      },
      onError: () => toast({ title: "خطأ", description: "تعذر تشغيل الاختبار", variant: "destructive" }),
    });
  };

  if (isLoading) {
    return <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Twitter className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">أتمتة النشر على X (تويتر)</h2>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm">تفعيل النشر اليومي التلقائي</div>
              <div className="text-xs text-muted-foreground">ينشر منشور اليوم في الوقت المحدد بتوقيت الرياض</div>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>وقت النشر (الرياض)</Label>
              <Input type="time" value={postTime} onChange={e => setPostTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>حساب X (اختياري)</Label>
              <Input value={handle} onChange={e => setHandle(e.target.value)} placeholder="@mawaeedak" className="dir-ltr" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>قالب المنشور</Label>
            <Textarea value={template} onChange={e => setTemplate(e.target.value)} rows={4}
              placeholder="استخدم {date} للتاريخ الهجري و {message} لرسالة اليوم" />
            <p className="text-[11px] text-muted-foreground">المتغيرات المتاحة: {"{date}"} (التاريخ الهجري) · {"{message}"} (رسالة اليوم)</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 ml-1" /> حفظ</>}
            </Button>
            <Button variant="outline" onClick={handlePreview} disabled={preview.isPending}>
              {preview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Eye className="w-4 h-4 ml-1" /> معاينة</>}
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={test.isPending}>
              {test.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 ml-1" /> اختبار النشر</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {previewText && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 space-y-2">
            <div className="text-sm font-bold flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> معاينة المنشور</div>
            <div className="p-3 rounded-lg bg-muted/40 text-sm whitespace-pre-wrap text-foreground">{previewText}</div>
            <div className="text-[11px] text-muted-foreground">{previewText.length} حرف</div>
          </CardContent>
        </Card>
      )}

      {testResult && (
        <Card className={`border shadow-sm ${testResult.ok ? "border-emerald-500/40" : "border-amber-500/40"}`}>
          <CardContent className="p-4 flex items-start gap-3">
            {testResult.ok
              ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
            <div className="space-y-1">
              <div className="text-sm text-foreground">{testResult.message}</div>
              {testResult.missing && testResult.missing.length > 0 && (
                <div className="text-[11px] text-muted-foreground dir-ltr">{testResult.missing.join(", ")}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="text-sm font-bold">المفاتيح المطلوبة للنشر المباشر</div>
          <p className="text-xs text-muted-foreground">النشر الفعلي إلى X يتطلب إضافة هذه المفاتيح كأسرار في بيئة التشغيل. حتى ذلك الحين يعمل وضع المعاينة والاختبار فقط دون نشر فعلي.</p>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_SECRETS.map(s => (
              <span key={s} className="text-[11px] px-2 py-1 rounded-lg bg-muted font-mono text-muted-foreground dir-ltr">{s}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-4 space-y-2">
          <div className="text-sm font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> سجل النشاط</div>
          {(logs ?? []).length === 0 ? (
            <div className="text-xs text-muted-foreground py-4 text-center">لا يوجد نشاط بعد</div>
          ) : (
            <div className="divide-y divide-border">
              {(logs ?? []).slice(0, 20).map(l => (
                <div key={l.id} className="py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold ml-2">{l.kind}</span>
                    <span className="text-xs text-muted-foreground">{l.detail ?? l.status}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground dir-ltr shrink-0">{format(new Date(l.created_at), "MM-dd HH:mm")}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
