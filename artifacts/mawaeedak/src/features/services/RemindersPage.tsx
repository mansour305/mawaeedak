/**
 * RemindersPage — Premium Saudi Design
 * Reminders service with premium styling.
 */

import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Bell, Edit2, Trash2, Calendar, Clock, Cloud, AlertCircle } from "lucide-react";

export type ReminderDateType = "gregorian";

export type RemindBeforeUnit = "minutes" | "hours" | "days";

export type Reminder = {
  id: string;
  title: string;
  dateType: ReminderDateType;
  date: string;
  time: string;
  remindBeforeValue: number;
  remindBeforeUnit: RemindBeforeUnit;
  note: string;
  isActive: boolean;
  createdAt: string;
};

const REMINDERS_STORAGE_KEY = "mawaeedak_reminders_v1";

function loadReminders(): Reminder[] {
  try {
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.map((reminder) => ({ ...reminder, dateType: "gregorian" as const }))
        : [];
    }
  } catch {
    // Ignore
  }
  return [];
}

function saveReminders(reminders: Reminder[]): void {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch {
    // Ignore
  }
}

function generateId(): string {
  return `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getRemindBeforeLabel(value: number, unit: RemindBeforeUnit): string {
  const unitLabel = {
    minutes: "دقيقة",
    hours: "ساعة",
    days: "يوم",
  }[unit];
  
  if (value === 1) {
    return unitLabel;
  }
  return `${value} ${unitLabel}`;
}

function isReminderPast(reminder: Reminder): boolean {
  try {
    const [year, month, day] = reminder.date.split("-").map(Number);
    const [hours, minutes] = reminder.time.split(":").map(Number);
    
    const targetDate = new Date(year, month - 1, day, hours, minutes);
    
    // Calculate reminder time (subtract remind before)
    const remindBeforeMs = {
      minutes: reminder.remindBeforeValue * 60 * 1000,
      hours: reminder.remindBeforeValue * 60 * 60 * 1000,
      days: reminder.remindBeforeValue * 24 * 60 * 60 * 1000,
    }[reminder.remindBeforeUnit];
    
    const reminderTime = new Date(targetDate.getTime() - remindBeforeMs);
    
    return reminderTime < new Date();
  } catch {
    return false;
  }
}

export default function RemindersPage() {
  const { toast } = useToast();
  
  // State
  const [reminders, setReminders] = useState<Reminder[]>(loadReminders);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Selected
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(null);
  
  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formRemindBeforeValue, setFormRemindBeforeValue] = useState("30");
  const [formRemindBeforeUnit, setFormRemindBeforeUnit] = useState<RemindBeforeUnit>("minutes");
  const [formNote, setFormNote] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  
  // Persist to localStorage
  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);
  
  // Reset form
  const resetForm = () => {
    setFormTitle("");
    setFormDate("");
    setFormTime("");
    setFormRemindBeforeValue("30");
    setFormRemindBeforeUnit("minutes");
    setFormNote("");
  };
  
  // Open edit
  const openEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormTitle(reminder.title);
    setFormDate(reminder.date);
    setFormTime(reminder.time);
    setFormRemindBeforeValue(reminder.remindBeforeValue.toString());
    setFormRemindBeforeUnit(reminder.remindBeforeUnit);
    setFormNote(reminder.note);
    setIsEditOpen(true);
  };
  
  // Handle add
  const handleAdd = () => {
    if (!formTitle.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال عنوان التذكير", variant: "destructive" });
      return;
    }
    
    if (!formDate) {
      toast({ title: "خطأ", description: "الرجاء إدخال التاريخ", variant: "destructive" });
      return;
    }
    
    if (!formTime) {
      toast({ title: "خطأ", description: "الرجاء إدخال الوقت", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const newReminder: Reminder = {
        id: generateId(),
        title: formTitle.trim(),
        dateType: "gregorian",
        date: formDate,
        time: formTime,
        remindBeforeValue: parseInt(formRemindBeforeValue) || 30,
        remindBeforeUnit: formRemindBeforeUnit,
        note: formNote,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      
      setReminders(prev => [newReminder, ...prev]);
      toast({ title: "تم إضافة التذكير" });
      setIsAddOpen(false);
      resetForm();
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الإضافة", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle edit
  const handleEdit = () => {
    if (!editingReminder) return;
    
    if (!formTitle.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال عنوان التذكير", variant: "destructive" });
      return;
    }
    
    if (!formDate || !formTime) {
      toast({ title: "خطأ", description: "الرجاء إدخال التاريخ والوقت", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updatedReminder: Reminder = {
        ...editingReminder,
        title: formTitle.trim(),
        dateType: "gregorian",
        date: formDate,
        time: formTime,
        remindBeforeValue: parseInt(formRemindBeforeValue) || 30,
        remindBeforeUnit: formRemindBeforeUnit,
        note: formNote,
      };
      
      setReminders(prev => prev.map(r => r.id === updatedReminder.id ? updatedReminder : r));
      toast({ title: "تم تحديث التذكير" });
      setIsEditOpen(false);
      setEditingReminder(null);
      resetForm();
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء التحديث", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!deletingReminderId) return;
    
    setReminders(prev => prev.filter(r => r.id !== deletingReminderId));
    toast({ title: "تم حذف التذكير" });
    setIsDeleteOpen(false);
    setDeletingReminderId(null);
  };
  
  // Filter active/upcoming reminders
  const activeReminders = useMemo(() => 
    reminders.filter(r => r.isActive && !isReminderPast(r)),
    [reminders]
  );
  
  const pastReminders = useMemo(() => 
    reminders.filter(r => isReminderPast(r)),
    [reminders]
  );
  
  // Format date based on type
  const formatDate = (reminder: Reminder) => {
    const dateStr = new Date(reminder.date).toLocaleDateString("ar-SA");
    return `${dateStr} (ميلادي)`;
  };
  
  return (
    <AppShell title="ذكرني" showBack>
      <div className="space-y-5 pb-6">
        
        {/* Header Card */}
        <div className="rounded-3xl p-6 text-center" style={{
          background: "linear-gradient(145deg, #fff8f0 0%, #fff 100%)",
          boxShadow: "0 8px 32px rgba(201,160,99,0.15)",
          border: "1px solid rgba(201,160,99,0.2)",
        }}>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{
            background: "linear-gradient(145deg, #C9A063 0%, #A67C3D 100%)",
            boxShadow: "0 4px 16px rgba(201,160,99,0.4)",
          }}>
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black" style={{ color: "#2F2B25" }}>تذكيراتك</h2>
          <p className="text-sm mt-1" style={{ color: "#6F6557" }}>لا تفوّت أي موعد مهم</p>
        </div>

        {/* Local-only notice */}
        <div className="text-center text-xs px-4 py-2 rounded-xl" style={{ background: "rgba(201,160,99,0.1)", color: "#92400e" }}>
          💾 محفوظ على هذا الجهاز فقط
        </div>
        
        {/* Add Button */}
        <div className="flex justify-center">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-8 text-base font-bold rounded-2xl shadow-lg" style={{
                background: "linear-gradient(145deg, #C9A063 0%, #A67C3D 100%)",
                boxShadow: "0 4px 16px rgba(201,160,99,0.4)",
              }}>
                <Plus className="w-5 h-5 ml-2" />
                إضافة تذكير
              </Button>
            </DialogTrigger>
            <DialogContent className="rtl max-w-[400px] rounded-2xl max-h-[90vh] overflow-y-auto" style={{
              background: "linear-gradient(145deg, #fff8f0 0%, #fff 100%)",
            }}>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold" style={{ color: "#2F2B25" }}>إضافة تذكير جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>عنوان التذكير *</Label>
                  <Input 
                    value={formTitle} 
                    onChange={e => setFormTitle(e.target.value)} 
                    placeholder="مثال: موعد الطبيب"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>التاريخ *</Label>
                    <Input 
                      type="date"
                      value={formDate} 
                      onChange={e => setFormDate(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الوقت *</Label>
                    <Input 
                      type="time"
                      value={formTime} 
                      onChange={e => setFormTime(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>تذكيري قبل</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      className="flex-1"
                      value={formRemindBeforeValue} 
                      onChange={e => setFormRemindBeforeValue(e.target.value)} 
                      min="1"
                    />
                    <Select value={formRemindBeforeUnit} onValueChange={(v) => setFormRemindBeforeUnit(v as RemindBeforeUnit)}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rtl">
                        <SelectItem value="minutes">دقائق</SelectItem>
                        <SelectItem value="hours">ساعات</SelectItem>
                        <SelectItem value="days">أيام</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>ملاحظة (اختياري)</Label>
                  <Textarea 
                    value={formNote} 
                    onChange={e => setFormNote(e.target.value)} 
                    placeholder="تفاصيل إضافية..."
                    rows={2}
                  />
                </div>
                
                <Button 
                  className="w-full h-11 font-bold" 
                  onClick={handleAdd}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التذكير"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Active Reminders */}
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(36 72% 52%)" }} />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
            <p className="font-bold text-red-600">تعذّر تحميل التذكيرات</p>
          </div>
        ) : activeReminders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C9A063]/40 bg-[#FAF7F2] p-8 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: "#C9A063" }} />
            <h3 className="text-lg font-extrabold mb-2" style={{ color: "#2F2B25" }}>
              لا توجد تذكيرات نشطة
            </h3>
            <p className="text-sm font-medium" style={{ color: "#6F6557" }}>
              أضف تذكيراً جديداً لتتذكر مواعيدك المهمة
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeReminders.map(reminder => (
              <div
                key={reminder.id}
                className="rounded-2xl bg-white p-4"
                style={{
                  borderColor: "rgba(201,160,99,0.24)",
                  boxShadow: "0 14px 34px rgba(138,107,61,0.10)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                    background: "linear-gradient(135deg, hsl(36 72% 52% / 0.15), hsl(36 72% 52% / 0.05))",
                    border: "1px solid hsl(36 72% 52% / 0.3)",
                  }}>
                    <Bell className="w-5 h-5" style={{ color: "#C9A063" }} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-extrabold text-[16px]" style={{ color: "#2F2B25" }}>
                      {reminder.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: "#6F6557" }}>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(reminder)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {reminder.time}
                      </span>
                    </div>
                    
                    <p className="text-xs mt-1" style={{ color: "#C9A063" }}>
                      تذكير قبل: {getRemindBeforeLabel(reminder.remindBeforeValue, reminder.remindBeforeUnit)}
                    </p>
                    
                    {reminder.note && (
                      <p className="text-xs mt-2 p-2 rounded-lg" style={{ 
                        background: "hsl(36 72% 52% / 0.05)",
                        color: "#6F6557",
                      }}>
                        {reminder.note}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => openEdit(reminder)}
                    >
                      <Edit2 className="w-4 h-4" style={{ color: "#6F6557" }} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => { setDeletingReminderId(reminder.id); setIsDeleteOpen(true); }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Past Reminders */}
        {pastReminders.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-[16px]" style={{ color: "#8A6B3D" }}>
              التذكيرات السابقة
            </h3>
            {pastReminders.map(reminder => (
              <div
                key={reminder.id}
                className="rounded-2xl border bg-gray-50/50 p-4 opacity-60"
                style={{ borderColor: "rgba(0,0,0,0.1)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: "#6F6557" }}>
                      {reminder.title}
                    </h4>
                    <p className="text-xs" style={{ color: "#6F6557" }}>
                      {formatDate(reminder)} - {reminder.time}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => { setDeletingReminderId(reminder.id); setIsDeleteOpen(true); }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Delete Confirm */}
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="حذف التذكير"
          description="هل أنت متأكد من حذف هذا التذكير؟"
          confirmText="حذف"
          onConfirm={handleDelete}
          destructive
        />
        
        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل التذكير</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>عنوان التذكير *</Label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التاريخ *</Label>
                  <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>الوقت *</Label>
                  <Input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>تذكيري قبل</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    className="flex-1"
                    value={formRemindBeforeValue} 
                    onChange={e => setFormRemindBeforeValue(e.target.value)} 
                    min="1"
                  />
                  <Select value={formRemindBeforeUnit} onValueChange={(v) => setFormRemindBeforeUnit(v as RemindBeforeUnit)}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rtl">
                      <SelectItem value="minutes">دقائق</SelectItem>
                      <SelectItem value="hours">ساعات</SelectItem>
                      <SelectItem value="days">أيام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>ملاحظة</Label>
                <Textarea value={formNote} onChange={e => setFormNote(e.target.value)} rows={2} />
              </div>
              
              <Button className="w-full h-11 font-bold" onClick={handleEdit} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التعديلات"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
      </div>
    </AppShell>
  );
}

