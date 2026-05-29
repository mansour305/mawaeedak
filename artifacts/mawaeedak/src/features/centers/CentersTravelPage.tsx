import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { Plane, MapPin, Calendar, CheckSquare, Plus, Trash2, Edit2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "mawaeedak_travel_v1";
const CHECKLIST_KEY = "mawaeedak_travel_checklist_v1";

const DEFAULT_CHECKLIST = [
  "جواز السفر / الهوية الوطنية",
  "تذاكر الطيران",
  "حجز الفندق",
  "بطاقات ائتمانية ومصروف نقدي",
  "شاحن الهاتف ومحول طاقة",
  "أدوية شخصية",
  "ملابس كافية",
  "تأمين السفر",
];

interface Trip {
  id: string;
  from: string;
  to: string;
  date: string;
  flightNo: string;
  hotel: string;
  status: "مؤكد" | "في الانتظار" | "ملغي";
}

function loadTrips(): Trip[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadChecked(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function CentersTravelPage() {
  const [trips, setTrips] = useState<Trip[]>(loadTrips);
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [from, setFrom] = useState("الرياض");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [hotel, setHotel] = useState("");
  const [status, setStatus] = useState<Trip["status"]>("مؤكد");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked));
  }, [checked]);

  const resetForm = () => {
    setFrom("الرياض"); setTo(""); setDate(""); setFlightNo(""); setHotel(""); setStatus("مؤكد"); setEditId(null);
  };

  const handleSave = () => {
    if (!to.trim() || !date) {
      toast({ title: "يرجى تعبئة الوجهة والتاريخ", variant: "destructive" });
      return;
    }
    if (editId) {
      setTrips(prev => prev.map(t => t.id === editId ? { ...t, from, to, date, flightNo, hotel, status } : t));
      toast({ title: "تم تحديث الرحلة" });
    } else {
      const trip: Trip = { id: Date.now().toString(), from, to, date, flightNo, hotel, status };
      setTrips(prev => [...prev, trip]);
      toast({ title: "تمت إضافة الرحلة" });
    }
    resetForm();
    setIsOpen(false);
  };

  const openEdit = (trip: Trip) => {
    setFrom(trip.from); setTo(trip.to); setDate(trip.date);
    setFlightNo(trip.flightNo); setHotel(trip.hotel); setStatus(trip.status);
    setEditId(trip.id);
    setIsOpen(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setTrips(prev => prev.filter(t => t.id !== deleteId));
    setDeleteId(null);
    toast({ title: "تم حذف الرحلة" });
  };

  const toggleCheck = (item: string) => {
    setChecked(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const statusColor: Record<string, string> = {
    "مؤكد": "bg-emerald-500/10 text-emerald-600",
    "في الانتظار": "bg-yellow-500/10 text-yellow-600",
    "ملغي": "bg-red-500/10 text-red-600",
  };

  const daysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `${diff} يوم`;
    if (diff === 0) return "اليوم";
    return `منذ ${Math.abs(diff)} يوم`;
  };

  const checkedCount = DEFAULT_CHECKLIST.filter(i => checked[i]).length;

  return (
    <AppShell title="مركز السفر" showBack>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">رحلاتي القادمة</h2>
              <p className="text-sm text-muted-foreground">{trips.length} رحلة مسجلة</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={v => { setIsOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="font-bold rounded-xl gap-1">
                <Plus className="w-4 h-4" /> رحلة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="rtl max-w-[400px] rounded-xl">
              <DialogHeader>
                <DialogTitle>{editId ? "تعديل الرحلة" : "إضافة رحلة جديدة"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">من</Label>
                    <Input value={from} onChange={e => setFrom(e.target.value)} placeholder="الرياض" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">إلى *</Label>
                    <Input value={to} onChange={e => setTo(e.target.value)} placeholder="دبي" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">تاريخ السفر *</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">رقم الرحلة</Label>
                    <Input value={flightNo} onChange={e => setFlightNo(e.target.value)} placeholder="SV 500" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">الحالة</Label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as Trip["status"])}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>مؤكد</option>
                      <option>في الانتظار</option>
                      <option>ملغي</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">الفندق أو الإقامة</Label>
                  <Input value={hotel} onChange={e => setHotel(e.target.value)} placeholder="اسم الفندق وموقعه" />
                </div>
                <Button className="w-full font-bold h-11" onClick={handleSave}>
                  {editId ? "تحديث الرحلة" : "إضافة الرحلة"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {trips.length > 0 ? (
          <div className="space-y-3">
            {trips
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(trip => (
                <Card key={trip.id} className="border-border shadow-sm border-r-4 border-r-sky-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Plane className="w-5 h-5 text-sky-500" />
                        <h3 className="font-bold">{trip.from} ← {trip.to}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColor[trip.status]}`}>
                          {trip.status}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(trip)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(trip.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{trip.date}</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium text-sky-600">
                        <span>{daysUntil(trip.date)}</span>
                      </div>
                      {trip.flightNo && (
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4" />
                          <span>{trip.flightNo}</span>
                        </div>
                      )}
                      {trip.hotel && (
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="w-4 h-4" />
                          <span>{trip.hotel}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="p-8 text-center">
              <Plane className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
              <p className="font-bold text-muted-foreground">لا توجد رحلات مسجلة</p>
              <p className="text-sm text-muted-foreground mt-1">اضغط "رحلة جديدة" لإضافة أول رحلة</p>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              قائمة التجهيز
            </h3>
            <span className="text-sm font-medium text-primary">
              {checkedCount} / {DEFAULT_CHECKLIST.length}
            </span>
          </div>
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {DEFAULT_CHECKLIST.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[item]}
                      onChange={() => toggleCheck(item)}
                      className="w-5 h-5 rounded border-border accent-[hsl(var(--primary))] focus:ring-0"
                    />
                    <span className={`font-medium ${checked[item] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
          {checkedCount === DEFAULT_CHECKLIST.length && (
            <div className="mt-3 text-center text-sm font-bold text-emerald-600 bg-emerald-500/10 p-3 rounded-xl">
              جهّزت كل شيء — رحلة سعيدة!
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={o => { if (!o) setDeleteId(null); }}
        title="حذف الرحلة"
        description="هل أنت متأكد من حذف هذه الرحلة؟ لا يمكن التراجع."
        confirmText="حذف"
        onConfirm={handleDelete}
      />
    </AppShell>
  );
}
