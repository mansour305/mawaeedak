import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComplaint } from "@api-client";
import { useToast } from "@/hooks/use-toast";
import { Mail, Clock, Headphones, CheckCircle2, Loader2 } from "lucide-react";

export default function SupportPage() {
  const { toast } = useToast();
  const createComplaint = useCreateComplaint();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "خطأ", description: "الموضوع والرسالة مطلوبان", variant: "destructive" });
      return;
    }
    createComplaint.mutate(
      { data: { type: "استفسار", message: `[${subject.trim()}]\n\n${message.trim()}`, contact: contact || undefined } },
      { onSuccess: () => setIsSuccess(true) }
    );
  };

  return (
    <AppShell title="اتصل بنا" showBack>
      <div className="space-y-6 pb-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">كيف يمكننا مساعدتك؟</h2>
            <p className="text-sm text-muted-foreground">نهتم بكل رسالة تصلنا</p>
          </div>
        </div>

        {/* Contact Info */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">البريد الإلكتروني</div>
                <a href="mailto:support@mawaeedak.sa" className="text-xs text-primary hover:underline" dir="ltr">
                  support@mawaeedak.sa
                </a>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">ساعات العمل</div>
                <div className="text-xs text-muted-foreground">الأحد – الخميس، 9:00 ص – 5:00 م</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        {isSuccess ? (
          <Card className="border-emerald-500/30 bg-emerald-500/5 text-center py-12">
            <CardContent className="flex flex-col items-center gap-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              <div>
                <h3 className="text-xl font-bold text-emerald-700 mb-2">تم الإرسال بنجاح</h3>
                <p className="text-emerald-600/80 text-sm">سنتواصل معك في أقرب وقت ممكن.</p>
              </div>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => { setIsSuccess(false); setSubject(""); setMessage(""); setContact(""); }}
              >
                إرسال رسالة أخرى
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-base text-foreground">نموذج التواصل</h3>

              <div className="space-y-2">
                <Label>الموضوع <span className="text-destructive">*</span></Label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="موضوع رسالتك"
                  className="h-12 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label>الرسالة <span className="text-destructive">*</span></Label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder="اكتب رسالتك هنا..."
                  className="bg-background resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>وسيلة التواصل (اختياري)</Label>
                <Input
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="بريد إلكتروني أو رقم جوال"
                  className="h-12 bg-background"
                  dir="ltr"
                />
              </div>

              <Button
                className="w-full h-12 font-bold text-base"
                onClick={handleSubmit}
                disabled={createComplaint.isPending}
              >
                {createComplaint.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال الرسالة"}
              </Button>

              <p className="text-[11px] text-muted-foreground text-center">
                رسائلك تُحفظ داخلياً لمراجعتها من فريق المنصة
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

