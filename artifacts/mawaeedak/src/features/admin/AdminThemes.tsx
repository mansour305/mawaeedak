/**
 * AdminThemes — Phase 12M
 *
 * Read:   useGatewayThemes → API (mode=api/shadow) | Supabase (mode=supabase)
 * Write:  gwUpdateTheme (edit + toggle)
 *           mode=api/shadow → PATCH /api/themes/:id
 *           mode=supabase   → Supabase UPDATE
 *
 * Default theme:
 * - mode=supabase   → public.app_settings upsert (no api-server dependency)
 * - mode=api/shadow → legacy API endpoint when a deployed API exists
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme, setCachedGlobalDefault } from "@/hooks/useTheme";
import { authedFetch } from "@/lib/apiAuth";
import { DATA_SOURCE_MODE } from "@/lib/dataSourceMode";
import { supabase } from "@/lib/supabase";
import { getListThemesQueryKey } from "@api-client";
import { Edit2, Loader2, Paintbrush, Check } from "lucide-react";
import { useGatewayThemes, gwQueryKeys } from "@/hooks/useGatewayData";
import { gwUpdateTheme } from "@/lib/dataGateway";

const TIER_LABELS: Record<string, string> = {
  free: "مجاني",
  premium: "مميز داخلي",
  unavailable: "غير متاح حالياً",
  owner: "للمالك فقط",
};

function getSwatchColors(colors: unknown): [string, string, string] {
  if (!colors || typeof colors !== "object") return ["#8B6914", "#FFF8E7", "#3D2B1F"];
  const c = colors as Record<string, string>;
  return [c.primary || "#8B6914", c.background || "#FFF8E7", c.card || c.background || "#F5EDD8"];
}

export default function AdminThemes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { globalDefault } = useTheme();
  const [defaultPending, setDefaultPending] = useState<string | null>(null);

  const { data: themes, isLoading, refetch: refetchThemes } = useGatewayThemes();

  const [savePending, setSavePending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [tier, setTier] = useState("free");

  const invalidateThemes = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.themes });
    queryClient.invalidateQueries({ queryKey: getListThemesQueryKey() });
    void refetchThemes();
  };

  const openEdit = (theme: { id: number; name: string; description?: string | null; is_active: boolean; tier?: string }) => {
    setEditId(theme.id);
    setName(theme.name);
    setDescription(theme.description ?? "");
    setIsActive(theme.is_active);
    setTier(theme.tier ?? "free");
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name || !editId) return;
    setSavePending(true);
    try {
      const result = await gwUpdateTheme(editId, { name, description: description || undefined, is_active: isActive, tier });
      if (result.success) {
        toast({ title: "تم التعديل" });
        setIsOpen(false);
        invalidateThemes();
      } else {
        toast({ title: "فشل التعديل", description: result.error ?? "خطأ غير معروف", variant: "destructive" });
      }
    } finally {
      setSavePending(false);
    }
  };

  const handleSetDefault = async (theme: { slug: string; name: string }) => {
    setDefaultPending(theme.slug);
    try {
      if (DATA_SOURCE_MODE === "supabase") {
        if (!supabase) {
          toast({ title: "Supabase غير متصل", description: "تحقق من VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY", variant: "destructive" });
          return;
        }

        const { error } = await supabase.from("app_settings").upsert(
          {
            key: "default_theme",
            value: theme.slug,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "key" }
        );

        if (error) {
          toast({ title: "فشل التعيين", description: error.message, variant: "destructive" });
          return;
        }

        setCachedGlobalDefault(theme.slug);
        toast({ title: `تم تعيين "${theme.name}" كثيم افتراضي عام`, description: "تم الحفظ في Supabase بدون الاعتماد على api-server" });
        return;
      }

      const resp = await authedFetch("/api/settings/default-theme", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: theme.slug }),
      });
      if (resp.ok) {
        setCachedGlobalDefault(theme.slug);
        toast({ title: `تم تعيين "${theme.name}" كثيم افتراضي عام`, description: "يُطبَّق على جميع المستخدمين الذين لم يختاروا ثيماً خاصاً" });
      } else if (resp.status === 401 || resp.status === 403) {
        toast({ title: "صلاحيات غير كافية", description: "تعيين الافتراضي العام متاح للمالك فقط", variant: "destructive" });
      } else {
        const err = await resp.json().catch(() => null);
        toast({ title: "فشل التعيين", description: (err && (err.error?.message || err.error)) || "خطأ غير معروف", variant: "destructive" });
      }
    } catch {
      toast({ title: "فشل التعيين", description: DATA_SOURCE_MODE === "supabase" ? "تعذر الحفظ في Supabase" : "تعذر الاتصال بالخادم", variant: "destructive" });
    } finally {
      setDefaultPending(null);
    }
  };

  const handleToggleActive = async (theme: { id: number; name: string; is_active: boolean }) => {
    const result = await gwUpdateTheme(theme.id, { is_active: !theme.is_active });
    if (result.success) {
      toast({ title: theme.is_active ? "تم تعطيل الثيم" : "تم تفعيل الثيم" });
      invalidateThemes();
    } else {
      toast({ title: "فشل التحديث", description: result.error ?? "خطأ غير معروف", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: "linear-gradient(180deg, hsl(38 62% 52%), hsl(32 55% 42%))" }}
        />
        <h1 className="text-2xl font-extrabold" style={{ color: "hsl(22 62% 18%)" }}>
          إدارة الثيمات
        </h1>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rtl max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle>تعديل الثيم</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم الثيم</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>الوصف</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>الفئة</Label>
              <select
                value={tier}
                onChange={e => setTier(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(TIER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <Label>مفعّل ومتاح للمستخدمين</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={savePending}>
              {savePending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التعديلات"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : themes && themes.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {(Array.isArray(themes) ? themes : []).map(theme => {
            const [primary, bg] = getSwatchColors(theme.colors);
            const isCurrentDefault = globalDefault === theme.slug;
            return (
              <Card key={theme.id} className={`border-border shadow-sm overflow-hidden ${!theme.is_active ? "opacity-60" : ""}`}>
                <div className="h-1.5 w-full" style={{ backgroundColor: primary }} />
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center border border-border"
                      style={{ backgroundColor: bg }}
                    >
                      <Paintbrush className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm">{theme.name}</h4>
                        {isCurrentDefault && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            الحالي
                          </span>
                        )}
                        {!theme.is_active && (
                          <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">معطل</span>
                        )}
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          {TIER_LABELS[theme.tier ?? "free"] ?? "مجاني"}
                        </span>
                      </div>
                      {theme.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{theme.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Switch
                        checked={theme.is_active ?? false}
                        onCheckedChange={() => void handleToggleActive(theme)}
                        className="scale-75"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 ${isCurrentDefault ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
                        title="تعيين كافتراضي عام"
                        disabled={defaultPending === theme.slug || !theme.is_active}
                        onClick={() => void handleSetDefault(theme)}
                      >
                        {defaultPending === theme.slug ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-primary w-8 h-8" onClick={() => openEdit(theme)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
          لا توجد ثيمات
        </div>
      )}

      <p className="text-xs text-muted-foreground px-1">
        ملاحظة: تعيين الافتراضي العام يُحفَظ مركزياً في Supabase عند وضع الإنتاج الحالي، ولا يعتمد على api-server غير المنشور.
      </p>
    </div>
  );
}

