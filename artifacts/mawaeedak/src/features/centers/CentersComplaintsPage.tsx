import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateComplaint } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

export default function CentersComplaintsPage() {
  const { toast } = useToast();
  const createComplaint = useCreateComplaint();
  const [type, setType] = useState("اقتراح");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = () => {
    if (!message) { toast({ title: "خطأ", description: "الرسالة مطلوبة", variant: "destructive" }); return; }

    createComplaint.mutate({
      data: {
        type,
        category: type,
        title: title || undefined,
        message,
        contact: contact || undefined,
      }
    }, {
      onSuccess: () => {
        setIsSuccess(true);
      }
    });
  };

  return (
    <AppShell title="الشكاوى والاقتراحات" showBack>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">صوتك مسموع</h2>
            <p className="text-sm text-muted-foreground">أرسل اقتراحاتك أو أي مشكلة تواجهك</p>
          </div>
        </div>

        {isSuccess ? (
          <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm text-center py-12">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              <div>
                <h3 className="text-xl font-bold text-emerald-700 mb-2">تم الإرسال بنجاح</h3>
                <p className="text-emerald-600/80">شكراً لتواصلك معنا، نهتم بكل رسالة تصلنا لتحسين المنصة.</p>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => { setIsSuccess(false); setMessage(""); setContact(""); }}>
                إرسال رسالة أخرى
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="space-y-2">
                <Label>نوع الرسالة</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-12 bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent className="rtl">
                    <SelectItem value="اقتراح">اقتراح تطوير</SelectItem>
                    <SelectItem value="شكوى">شكوى / مشكلة فنية</SelectItem>
                    <SelectItem value="استفسار">استفسار عام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>العنوان (اختياري)</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان مختصر للرسالة" className="h-12 bg-background" />
              </div>

              <div className="space-y-2">
                <Label>الرسالة</Label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="اكتب تفاصيل رسالتك هنا..." className="bg-background resize-none" />
              </div>

              <div className="space-y-2">
                <Label>رقم الجوال أو البريد (اختياري)</Label>
                <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="للتواصل معك إن لزم الأمر" className="h-12 bg-background" dir="ltr" />
              </div>

              <Button className="w-full h-12 font-bold text-base mt-2" onClick={handleSubmit} disabled={createComplaint.isPending}>
                {createComplaint.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
