import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import {
  useCreateOfficialPrayerTime,
  useUpdateOfficialPrayerTime,
  useDeleteOfficialPrayerTime,
} from "@/hooks/useOfficialData";
import { Plus, Edit2, Trash2, Loader2, AlertTriangle } from "lucide-react";

/**
 * AdminOfficialPrayer — admin page to manage official prayer times. It lists
 * all records (confirmed and unconfirmed) and allows adding, editing and
 * deleting entries. Each prayer time record includes city, date and six
 * prayer times with metadata and confirmation status.
 */
export default function AdminOfficialPrayer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Fetch all prayer times
  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-official-prayer"],
    queryFn: async () => {
      if (!isSupabaseEnabled || !supabase) throw new Error("Supabase غير مفعّل");
      const { data, error } = await supabase
        .from("official_prayer_times")
        .select("*")
        .order("date_gregorian", { ascending: true })
        .order("city_key", { ascending: true });
      if (error) throw error;
      return data;
    },
    retry: 1,
    staleTime: 60_000,
  });

  const createEvent = useCreateOfficialPrayerTime(["admin-official-prayer"]);
  const updateEvent = useUpdateOfficialPrayerTime(["admin-official-prayer"]);
  const deleteEvent = useDeleteOfficialPrayerTime(["admin-official-prayer"]);

  // Dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  // Form fields
  const [cityKey, setCityKey] = useState("");
  const [cityName, setCityName] = useState("");
  const [dateGreg, setDateGreg] = useState("");
  const [dateHijri, setDateHijri] = useState("");
  const [fajr, setFajr] = useState("");
  const [sunrise, setSunrise] = useState("");
  const [dhuhr, setDhuhr] = useState("");
  const [asr, setAsr] = useState("");
  const [maghrib, setMaghrib] = useState("");
  const [isha, setIsha] = useState("");
  const [sourceAuthority, setSourceAuthority] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(true);
  // Delete
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const openAdd = () => {
    setIsEdit(false);
    setEditId(null);
    setCityKey("");
    setCityName("");
    setDateGreg("");
    setDateHijri("");
    setFajr("");
    setSunrise("");
    setDhuhr("");
    setAsr("");
    setMaghrib("");
    setIsha("");
    setSourceAuthority("");
    setSourceUrl("");
    setIsConfirmed(true);
    setIsOpen(true);
  };

  const openEdit = (ev: any) => {
    setIsEdit(true);
    setEditId(ev.id);
    setCityKey(ev.city_key || "");
    setCityName(ev.city_name_ar || "");
    setDateGreg(ev.date_gregorian || "");
    setDateHijri(ev.date_hijri || "");
    setFajr(ev.fajr_time || "");
    setSunrise(ev.sunrise_time || "");
    setDhuhr(ev.dhuhr_time || "");
    setAsr(ev.asr_time || "");
    setMaghrib(ev.maghrib_time || "");
    setIsha(ev.isha_time || "");
    setSourceAuthority(ev.source_authority || "");
    setSourceUrl(ev.source_url || "");
    setIsConfirmed(ev.is_confirmed ?? true);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!cityKey || !cityName || !dateGreg || !fajr || !sunrise || !dhuhr || !asr || !maghrib || !isha) {
      toast({ title: "خطأ", description: "يجب تعبئة كافة الحقول الأساسية", variant: "destructive" });
      return;
    }
    const data = {
      city_key: cityKey,
      city_name_ar: cityName,
      date_gregorian: dateGreg,
      date_hijri: dateHijri || null,
      fajr_time: fajr,
      sunrise_time: sunrise,
      dhuhr_time: dhuhr,
      asr_time: asr,
      maghrib_time: maghrib,
      isha_time: isha,
      source_authority: sourceAuthority || null,
      source_url: sourceUrl || null,
      is_confirmed: isConfirmed,
    } as Record<string, any>;
    if (isEdit && editId) {
      updateEvent.mutate({ id: editId, data }, {
        onSuccess: () => {
          toast({ title: "تم التعديل" });
          setIsOpen(false);
        },
        onError: (error: any) => {
          toast({ title: "فشل التعديل", description: error.message || "خطأ غير معروف", variant: "destructive" });
        },
      });
    } else {
      createEvent.mutate(data, {
        onSuccess: () => {
          toast({ title: "تمت الإضافة" });
          setIsOpen(false);
        },
        onError: (error: any) => {
          toast({ title: "فشل الإضافة", description: error.message || "خطأ غير معروف", variant: "destructive" });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteEvent.mutate(deleteId, {
      onSuccess: () => {
        toast({ title: "تم الحذف" });
        setIsDeleteOpen(false);
      },
      onError: (error: any) => {
        toast({ title: "فشل الحذف", description: error.message || "خطأ غير معروف", variant: "destructive" });
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">أوقات الصلاة الرسمية</h2>
        <Button onClick={openAdd} size="sm">
          <Plus className="w-4 h-4 ml-1" /> إضافة وقت
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="rtl max-w-[550px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "تعديل وقت الصلاة" : "وقت صلاة جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المفتاح (بالإنجليزية)</Label>
                <Input value={cityKey} onChange={e => setCityKey(e.target.value)} placeholder="مثال: riyadh" />
              </div>
              <div className="space-y-2">
                <Label>اسم المدينة (بالعربية)</Label>
                <Input value={cityName} onChange={e => setCityName(e.target.value)} placeholder="مثال: الرياض" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التاريخ الميلادي</Label>
                <Input type="date" value={dateGreg} onChange={e => setDateGreg(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>التاريخ الهجري (اختياري)</Label>
                <Input value={dateHijri} onChange={e => setDateHijri(e.target.value)} placeholder="مثال: 1448-01-27" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>الفجر</Label>
                <Input type="time" value={fajr} onChange={e => setFajr(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>الشروق</Label>
                <Input type="time" value={sunrise} onChange={e => setSunrise(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>الظهر</Label>
                <Input type="time" value={dhuhr} onChange={e => setDhuhr(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>العصر</Label>
                <Input type="time" value={asr} onChange={e => setAsr(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>المغرب</Label>
                <Input type="time" value={maghrib} onChange={e => setMaghrib(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>العشاء</Label>
                <Input type="time" value={isha} onChange={e => setIsha(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>الجهة الرسمية (اختياري)</Label>
              <Input value={sourceAuthority} onChange={e => setSourceAuthority(e.target.value)} placeholder="مثال: وزارة الشؤون الإسلامية" />
            </div>
            <div className="space-y-2">
              <Label>رابط المصدر (اختياري)</Label>
              <Input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://" />
            </div>
            <div className="flex items-center justify-between">
              <Label>مؤكد</Label>
              <Switch checked={isConfirmed} onCheckedChange={setIsConfirmed} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={createEvent.isPending || updateEvent.isPending}>
              {createEvent.isPending || updateEvent.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : events && events.length > 0 ? (
        <div className="space-y-3">
          {(events as any[]).map(ev => (
            <Card key={ev.id} className={`border-border shadow-sm overflow-hidden ${!ev.is_confirmed ? 'opacity-70' : ''}`}>
              <CardContent className="p-4 w-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold">{ev.city_name_ar}</span>
                    <span className="text-xs text-muted-foreground">{ev.city_key}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">{ev.date_gregorian}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mb-1">
                  الفجر {ev.fajr_time} · الشروق {ev.sunrise_time} · الظهر {ev.dhuhr_time} · العصر {ev.asr_time} · المغرب {ev.maghrib_time} · العشاء {ev.isha_time}
                </div>
                <div className="flex justify-between items-center border-t border-border pt-3 mt-2">
                  <div className="text-xs text-muted-foreground">{ev.is_confirmed ? "مؤكد" : "غير مؤكد"}</div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openEdit(ev)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleteId(ev.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
          لا توجد سجلات أوقات صلاة
        </div>
      )}

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="حذف الوقت الرسمي"
        description="هل أنت متأكد من الحذف؟"
        onConfirm={handleDelete}
      />
    </div>
  );
}