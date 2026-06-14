/**
 * AdminStory — Phase 12M
 *
 * Read:   useGatewayStoryTemplates → API (mode=api/shadow) | Supabase (mode=supabase)
 * Write:  gwCreateStoryTemplate / gwUpdateStoryTemplate / gwDeleteStoryTemplate
 *           mode=api/shadow → /api/story-templates/:id
 *           mode=supabase   → Supabase INSERT/UPDATE/DELETE
 *
 * Invalidation: gwQueryKeys.storyTemplates + getListStoryTemplatesQueryKey
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListStoryTemplatesQueryKey } from "@api-client";
import { Plus, Edit2, Trash2, Loader2, Image } from "lucide-react";
import { useGatewayStoryTemplates, gwQueryKeys } from "@/hooks/useGatewayData";
import {
  gwCreateStoryTemplate,
  gwUpdateStoryTemplate,
  gwDeleteStoryTemplate,
} from "@/lib/dataGateway";

export default function AdminStory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Phase 12M: Gateway read
  const { data: templates, isLoading, refetch: refetchTemplates } = useGatewayStoryTemplates();

  const [savePending, setSavePending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateText, setTemplateText] = useState("");
  const [bgColor, setBgColor] = useState("#8B6914");
  const [textColor, setTextColor] = useState("#FFF8E7");
  const [isActive, setIsActive] = useState(true);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const invalidateTemplates = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.storyTemplates });
    queryClient.invalidateQueries({ queryKey: getListStoryTemplatesQueryKey() });
    void refetchTemplates();
  };

  const resetForm = () => {
    setName(""); setDescription(""); setTemplateText("");
    setBgColor("#8B6914"); setTextColor("#FFF8E7");
    setIsActive(true); setEditId(null); setIsEdit(false);
  };

  const openAdd = () => { resetForm(); setIsOpen(true); };

  const openEdit = (tpl: { id: number; name: string; description?: string | null; template_text?: string; background_color?: string | null; text_color?: string | null; is_active: boolean }) => {
    setIsEdit(true);
    setEditId(tpl.id);
    setName(tpl.name);
    setDescription(tpl.description ?? "");
    setTemplateText(tpl.template_text ?? "");
    setBgColor(tpl.background_color ?? "#8B6914");
    setTextColor(tpl.text_color ?? "#FFF8E7");
    setIsActive(tpl.is_active);
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const payload = {
      name, description: description || undefined,
      template_text: templateText || undefined,
      background_color: bgColor || undefined,
      text_color: textColor || undefined,
      is_active: isActive,
    };
    setSavePending(true);
    try {
      const result = isEdit && editId
        ? await gwUpdateStoryTemplate(editId, payload)
        : await gwCreateStoryTemplate({ ...payload, name });
      if (result.success) {
        toast({ title: isEdit ? "تم تعديل القالب" : "تم إضافة القالب" });
        setIsOpen(false);
        resetForm();
        invalidateTemplates();
      } else {
        toast({ title: isEdit ? "فشل التعديل" : "فشل الإضافة", description: result.error ?? "خطأ غير معروف", variant: "destructive" });
      }
    } finally {
      setSavePending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeletePending(true);
    try {
      const result = await gwDeleteStoryTemplate(deleteId);
      if (result.success) {
        toast({ title: "تم الحذف" });
        setIsDeleteOpen(false);
        setDeleteId(null);
        invalidateTemplates();
      } else {
        toast({ title: "فشل الحذف", description: result.error ?? "خطأ غير معروف", variant: "destructive" });
        setIsDeleteOpen(false);
      }
    } finally {
      setDeletePending(false);
    }
  };

  const handleToggleActive = async (tpl: { id: number; is_active: boolean }) => {
    const result = await gwUpdateStoryTemplate(tpl.id, { is_active: !tpl.is_active });
    if (result.success) {
      toast({ title: tpl.is_active ? "تم تعطيل القالب" : "تم تفعيل القالب" });
      invalidateTemplates();
    } else {
      toast({ title: "فشل التحديث", description: result.error ?? "خطأ غير معروف", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-1 h-6 rounded-full"
            style={{ background: "linear-gradient(180deg, hsl(38 62% 52%), hsl(32 55% 42%))" }}
          />
          <h1 className="text-2xl font-extrabold" style={{ color: "hsl(22 62% 18%)" }}>
            بطاقة اليوم / ستوري اليوم
          </h1>
        </div>
        <Dialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              إضافة قالب
            </Button>
          </DialogTrigger>
          <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEdit ? "تعديل القالب" : "إضافة قالب جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اسم القالب *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: القالب الرمضاني" />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف مختصر" />
              </div>
              <div className="space-y-2">
                <Label>نص القالب</Label>
                <Textarea
                  value={templateText}
                  onChange={e => setTemplateText(e.target.value)}
                  placeholder={"📅 {date}\n\n💬 {message}\n\n— مواعيدك"}
                  rows={5}
                  className="text-sm font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  متغيرات متاحة: {"{date}"} {"{message}"} {"{next_prayer}"} {"{time_remaining}"} {"{financial_summary}"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>لون الخلفية</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={e => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-border"
                    />
                    <Input value={bgColor} onChange={e => setBgColor(e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>لون النص</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={e => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border border-border"
                    />
                    <Input value={textColor} onChange={e => setTextColor(e.target.value)} className="font-mono text-xs" />
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed border"
                style={{ backgroundColor: bgColor, color: textColor, borderColor: bgColor }}
              >
                {templateText || "معاينة القالب..."}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Label>مفعّل في التطبيق</Label>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!name.trim() || savePending}>
                {savePending ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "حفظ التعديلات" : "إضافة القالب"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="حذف القالب"
        description="هل تريد حذف هذا القالب؟ لا يمكن التراجع."
        onConfirm={handleDelete}
      />

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="space-y-3">
          {(Array.isArray(templates) ? templates : []).map(tpl => (
            <Card key={tpl.id} className={`border-border shadow-sm overflow-hidden ${!tpl.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-0">
                <div className="h-2 w-full" style={{ backgroundColor: tpl.background_color ?? "#8B6914" }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border border-border"
                        style={{ backgroundColor: tpl.background_color ?? "#8B6914" }}
                      >
                        <Image className="w-5 h-5" style={{ color: tpl.text_color ?? "#FFF8E7" }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate">{tpl.name}</h4>
                          {!tpl.is_active && (
                            <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded shrink-0">
                              معطل
                            </span>
                          )}
                        </div>
                        {tpl.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{tpl.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1 font-mono">
                          {tpl.template_text?.slice(0, 60)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Switch
                        checked={tpl.is_active ?? false}
                        onCheckedChange={() => void handleToggleActive(tpl)}
                        className="scale-75"
                      />
                      <Button variant="ghost" size="icon" className="text-primary w-8 h-8" onClick={() => openEdit(tpl)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive w-8 h-8"
                        onClick={() => { setDeleteId(tpl.id); setIsDeleteOpen(true); }}
                        disabled={deletePending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
          <Image className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>لا توجد قوالب — أضف قالباً جديداً</p>
        </div>
      )}
    </div>
  );
}

