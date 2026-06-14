import { useState, useEffect, useMemo } from "react";
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
const CUSTOM_CHECKLIST_KEY = "mawaeedak_travel_custom_checklist_v1";

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

function loadCustomChecklist(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CUSTOM_CHECKLIST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()) : [];
  } catch {
    return [];
  }
}

export default function CentersTravelPage() {
  const [trips, setTrips] = useState<Trip[]>(loadTrips);
  const [checked, setChecked] = useState<Record<string, boolean>>(loadChecked);
  const [customChecklist, setCustomChecklist] = useState<string[]>(loadCustomChecklist);
  const [customItem, setCustomItem] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [from, setFrom] = useState("الرياض");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [hotel, setHotel] = useState("");
  const [status, setStatus] = useState<Trip["status"]>("مؤكد");

  const checklistItems = useMemo(() => {
    return [...DEFAULT_CHECKLIST, ...customChecklist];
  }, [customChecklist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_CHECKLIST_KEY, JSON.stringify(customChecklist));
  }, [customChecklist]);

  const resetForm = () => {
    setFrom("الرياض");
    setTo("");
    setDate("");
    setFlightNo("");
    setHotel("");
    setStatus("مؤكد");
    setEditId(null);
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
    setFrom(trip.from);
    setTo(trip.to);
    setDate(trip.date);
    setFlightNo(trip.flightNo);
    setHotel(trip.hotel);
    setStatus(trip.status);
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

  const addCustomChecklistItem = () => {
    const value = customItem.trim();
    if (!value) {
      toast({ title: "اكتب البند المخصص أولاً", variant: "destructive" });
      return;
    }

    if (checklistItems.includes(value)) {
      toast({ title: "هذا البند موجود مسبقًا", variant: "destructive" });
      return;
    }

    setCustomChecklist(prev => [...prev, value]);
    setCustomItem("");
    toast({ title: "تمت إضافة بند مخصص" });
  };

  const deleteCustomChecklistItem = (item: string) => {
    setCustomChecklist(prev => prev.filter(existing => existing !== item));
    setChecked(prev => {
      const next = { ...prev };
      delete next[item];
      return next;
    });
    toast({ title: "تم حذف البند المخصص" });
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

  const checkedCount = checklistItems.filter(i => checked[i]).length;

  return (
    <AppShell title="السفر" showBack>
      <div className="space-y-6 pb-6">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #C9A063, #A78042)" }}
            >
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold" style={{ color: "#2F2B25" }}>رحلاتي القادمة</h2>
              <p className="text-sm font-medium" style={{ color: "#6F6557" }}>{trips.length} رحلة مسجلة</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={v => { setIsOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <button 
                className="h-10 px-4 rounded-[16px] text-[14px] font-bold flex items-center gap-2 transition active:scale-[0.98]"
                style={{ 
                  background: "linear-gradient(135deg, #C9A063, #A78042)",
                  color: "white",
                  boxShadow: "0 4px 14px rgba(167,128,66,0.25)",
                }}
              >
                <Plus className="w-4 h-4" /> رحلة جديدة
              </button>
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
            {[...trips]
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(trip => (
                <div 
                  key={trip.id} 
                  className="rounded-[22px] border overflow-hidden"
                  style={{ 
                    borderColor: "rgba(201,160,99,0.22)",
                    background: "linear-gradient(145deg, #FFFCF7 0%, #FFF8EE 100%)",
                    boxShadow: "0 8px 24px rgba(138,107,61,0.08)",
                    borderRight: "4px solid #C9A063",
                  }}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Plane className="w-5 h-5" style={{ color: "#C9A063" }} />
                        <h3 className="font-extrabold text-[16px]" style={{ color: "#2F2B25" }}>{trip.from} ← {trip.to}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] px-2 py-1 rounded-full font-bold"
                          style={{
                            background: trip.status === "مؤكد" ? "rgba(16,185,129,0.12)" : trip.status === "في الانتظار" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                            color: trip.status === "مؤكد" ? "#059669" : trip.status === "في الانتظار" ? "#D97706" : "#DC2626",
                          }}
                        >
                          {trip.status}
                        </span>
                        <button 
                          onClick={() => openEdit(trip)} 
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:scale-110"
                          style={{ background: "rgba(201,160,99,0.10)" }}
                        >
                          <Edit2 className="w-3.5 h-3.5" style={{ color: "#8A6B3D" }} />
                        </button>
                        <button 
                          onClick={() => setDeleteId(trip.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition hover:scale-110"
                          style={{ background: "rgba(185,72,63,0.10)" }}
                        >
                          <Trash2 className="w-3.5 h-3.5" style={{ color: "#B9483F" }} />
                        </button>
                      </div>
                    </div>
                    <div 
                      className="grid grid-cols-2 gap-2 text-sm p-3 rounded-[14px]"
                      style={{ background: "rgba(201,160,99,0.06)" }}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: "#A78042" }} />
                        <span style={{ color: "#6F6557" }}>{trip.date}</span>
                      </div>
                      <div className="flex items-center gap-2 font-bold" style={{ color: "#C9A063" }}>
                        <span>{daysUntil(trip.date)}</span>
                      </div>
                      {trip.flightNo && (
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4" style={{ color: "#A78042" }} />
                          <span style={{ color: "#6F6557" }}>{trip.flightNo}</span>
                        </div>
                      )}
                      {trip.hotel && (
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin className="w-4 h-4" style={{ color: "#A78042" }} />
                          <span style={{ color: "#6F6557" }}>{trip.hotel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div 
            className="rounded-[22px] border border-dashed p-8 text-center"
            style={{ borderColor: "rgba(201,160,99,0.30)", background: "rgba(255,252,247,0.6)" }}
          >
            <Plane className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: "#C9A063" }} />
            <p className="font-extrabold" style={{ color: "#2F2B25" }}>لا توجد رحلات مسجلة</p>
            <p className="text-sm mt-1" style={{ color: "#6F6557" }}>اضغط "رحلة جديدة" لإضافة أول رحلة</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-lg flex items-center gap-2" style={{ color: "#2F2B25" }}>
              <CheckSquare className="w-5 h-5" style={{ color: "#C9A063" }} />
              قائمة التجهيز
            </h3>
            <span 
              className="text-sm font-bold px-3 py-1 rounded-full"
              style={{ 
                background: "rgba(201,160,99,0.12)", 
                color: "#8A6B3D" 
              }}
            >
              {checkedCount} / {checklistItems.length}
            </span>
          </div>

          {/* Custom item input */}
          <div 
            className="rounded-[18px] border p-3 mb-3"
            style={{ 
              borderColor: "rgba(201,160,99,0.22)",
              background: "linear-gradient(145deg, #FFFCF7 0%, #FFF8EE 100%)",
              boxShadow: "0 4px 14px rgba(138,107,61,0.08)",
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={customItem}
                onChange={(event) => setCustomItem(event.target.value)}
                placeholder="أضف بند مخصص مثل: رخصة دولية"
                className="flex-1 h-11 rounded-[14px] border px-4 text-[14px] font-medium bg-white"
                style={{ borderColor: "rgba(201,160,99,0.20)" }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addCustomChecklistItem();
                }}
              />
              <button 
                onClick={addCustomChecklistItem}
                className="h-11 px-4 rounded-[14px] text-[14px] font-bold flex items-center gap-2 transition active:scale-[0.98]"
                style={{ 
                  background: "linear-gradient(135deg, #C9A063, #A78042)",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(167,128,66,0.25)",
                }}
              >
                <Plus className="w-4 h-4" /> إضافة
              </button>
            </div>
          </div>

          {/* Checklist items */}
          <div 
            className="rounded-[20px] border overflow-hidden"
            style={{ 
              borderColor: "rgba(201,160,99,0.22)",
              background: "linear-gradient(145deg, #FFFCF7 0%, #FFF8EE 100%)",
              boxShadow: "0 8px 24px rgba(138,107,61,0.08)",
            }}
          >
            <div className="divide-y divide-[rgba(201,160,99,0.15)]" style={{ borderColor: "rgba(201,160,99,0.15)" }}>
              {checklistItems.map((item) => {
                const isCustom = customChecklist.includes(item);
                return (
                  <label
                    key={item}
                    className="flex items-center gap-3 p-4 cursor-pointer transition hover:bg-[rgba(201,160,99,0.05)]"
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[item]}
                      onChange={() => toggleCheck(item)}
                      className="w-5 h-5 rounded border-2"
                      style={{ 
                        accentColor: "#C9A063",
                        borderColor: checked[item] ? "#C9A063" : "rgba(201,160,99,0.30)",
                      }}
                    />
                    <span 
                      className={`flex-1 font-medium ${checked[item] ? "line-through opacity-60" : ""}`}
                      style={{ color: "#2F2B25" }}
                    >
                      {item}
                    </span>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          deleteCustomChecklistItem(item);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:scale-110"
                        style={{ background: "rgba(185,72,63,0.10)" }}
                        aria-label="حذف البند المخصص"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "#B9483F" }} />
                      </button>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
          {checkedCount === checklistItems.length && checklistItems.length > 0 && (
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

