/**
 * GoalsPage — Phase 16 Production Hardening
 * 
 * Goals service with real Supabase sync for logged-in users.
 * Local fallback for guests with clear indicator.
 * 
 * Storage behavior:
 * - Logged in + Supabase: reads/writes from Supabase
 * - Not logged in or Supabase unavailable: localStorage fallback
 * 
 * Schema: supabase/migrations/20250612000002_create_services_tables.sql
 */

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Target, Edit2, Trash2, Check, Calendar, Coins, AlertCircle, TrendingUp, Cloud } from "lucide-react";
import { useGoalsGateway, type Goal, type GoalType } from "@/lib/gateways/goalsGateway";

function computeStats(goal: Goal) {
  const remaining = goal.targetAmount ? goal.targetAmount - goal.currentProgress : null;
  const progressPercent = goal.targetAmount
    ? Math.min(100, Math.round((goal.currentProgress / goal.targetAmount) * 100))
    : 0;
  
  let dailyNeeded: number | null = null;
  let weeklyNeeded: number | null = null;
  
  if (remaining && remaining > 0 && goal.deadline) {
    const today = new Date();
    const deadlineDate = new Date(goal.deadline);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft > 0) {
      dailyNeeded = remaining / daysLeft;
      weeklyNeeded = dailyNeeded * 7;
    }
  }
  
  return { remaining, progressPercent, dailyNeeded, weeklyNeeded };
}

export default function GoalsPage() {
  const { toast } = useToast();
  const { goals, isLoading, isError, isSynced, add, update, delete: deleteGoal, complete, updateProgress } = useGoalsGateway();
  
  // Form state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);
  
  // Form fields
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<GoalType>("financial");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formRequirements, setFormRequirements] = useState("");
  const [formCurrentProgress, setFormCurrentProgress] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  
  const resetForm = () => {
    setFormName("");
    setFormType("financial");
    setFormTargetAmount("");
    setFormRequirements("");
    setFormCurrentProgress("");
    setFormDeadline("");
  };
  
  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormName(goal.name);
    setFormType(goal.type);
    setFormTargetAmount(goal.targetAmount?.toString() || "");
    setFormRequirements(goal.requirements);
    setFormCurrentProgress(goal.currentProgress?.toString() || "");
    setFormDeadline(goal.deadline || "");
    setIsEditOpen(true);
  };
  
  const handleAdd = async () => {
    if (!formName.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال اسم الهدف", variant: "destructive" });
      return;
    }
    
    if (formType === "financial" && !formTargetAmount) {
      toast({ title: "خطأ", description: "الرجاء إدخال المبلغ المستهدف", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await add({
        name: formName.trim(),
        type: formType,
        targetAmount: formType === "financial" ? parseFloat(formTargetAmount) || 0 : null,
        requirements: formRequirements,
        currentProgress: parseFloat(formCurrentProgress) || 0,
        deadline: formDeadline || null,
      });
      
      toast({ title: "تم إضافة الهدف" });
      setIsAddOpen(false);
      resetForm();
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الإضافة", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEdit = async () => {
    if (!editingGoal) return;
    
    if (!formName.trim()) {
      toast({ title: "خطأ", description: "الرجاء إدخال اسم الهدف", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await update({
        ...editingGoal,
        name: formName.trim(),
        type: formType,
        targetAmount: formType === "financial" ? parseFloat(formTargetAmount) || 0 : null,
        requirements: formRequirements,
        currentProgress: parseFloat(formCurrentProgress) || 0,
        deadline: formDeadline || null,
      });
      
      toast({ title: "تم تحديث الهدف" });
      setIsEditOpen(false);
      setEditingGoal(null);
      resetForm();
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء التحديث", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!deletingGoalId) return;
    
    try {
      await deleteGoal(deletingGoalId);
      toast({ title: "تم حذف الهدف" });
      setIsDeleteOpen(false);
      setDeletingGoalId(null);
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ أثناء الحذف", variant: "destructive" });
    }
  };
  
  const handleComplete = async () => {
    if (!completingGoalId) return;
    
    try {
      await complete(completingGoalId);
      toast({ title: "تم إكمال الهدف! 🎉" });
      setIsCompleteOpen(false);
      setCompletingGoalId(null);
    } catch {
      toast({ title: "خطأ", description: "حدث خطأ", variant: "destructive" });
    }
  };
  
  const activeGoals = goals.filter(g => !g.completedAt);
  const completedGoals = goals.filter(g => g.completedAt);
  
  return (
    <AppShell title="احسب هدفك" showBack>
      <div className="space-y-5 pb-6">
        
        {/* Sync status indicator */}
        {isSynced ? (
          <div className="flex items-center gap-2 text-xs text-green-600">
            <Cloud className="w-4 h-4" />
            <span>متزامن مع السحابة</span>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-2 text-xs" style={{ color: "#92400e" }}>
            <span className="font-semibold">💾 ملاحظة:</span> محفوظ على هذا الجهاز فقط. سجّل الدخول لمزامنة بياناتك.
          </div>
        )}
        
        {/* Add Button */}
        <div className="flex justify-center">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 px-6 text-base font-bold rounded-2xl" style={{
                background: "linear-gradient(135deg, hsl(36 72% 52%), hsl(28 68% 38%))",
              }}>
                <Plus className="w-5 h-5 ml-2" />
                إضافة هدف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة هدف جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>اسم الهدف *</Label>
                  <Input 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    placeholder="مثال: شراء سيارة"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>نوع الهدف</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as GoalType)}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rtl">
                      <SelectItem value="financial">مالي</SelectItem>
                      <SelectItem value="non-financial">غير مالي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formType === "financial" && (
                  <>
                    <div className="space-y-2">
                      <Label>المبلغ المستهدف *</Label>
                      <Input 
                        type="number"
                        value={formTargetAmount} 
                        onChange={e => setFormTargetAmount(e.target.value)} 
                        placeholder="100000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>التقدم الحالي</Label>
                      <Input 
                        type="number"
                        value={formCurrentProgress} 
                        onChange={e => setFormCurrentProgress(e.target.value)} 
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
                
                {formType === "non-financial" && (
                  <div className="space-y-2">
                    <Label>المتطلبات</Label>
                    <Textarea 
                      value={formRequirements} 
                      onChange={e => setFormRequirements(e.target.value)} 
                      placeholder="اكتب متطلباتك هنا..."
                      rows={3}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>الموعد النهائي</Label>
                  <Input 
                    type="date"
                    value={formDeadline} 
                    onChange={e => setFormDeadline(e.target.value)} 
                  />
                </div>
                
                <Button 
                  className="w-full h-11 font-bold" 
                  onClick={handleAdd}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ الهدف"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Active Goals */}
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(36 72% 52%)" }} />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
            <p className="font-bold text-red-600">تعذّر تحميل الأهداف</p>
            <Button 
              variant="outline" 
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              إعادة المحاولة
            </Button>
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C9A063]/40 bg-[#FAF7F2] p-8 text-center">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: "#C9A063" }} />
            <h3 className="text-lg font-extrabold mb-2" style={{ color: "#2F2B25" }}>
              لا توجد أهداف نشطة
            </h3>
            <p className="text-sm font-medium" style={{ color: "#6F6557" }}>
              ابدأ بإضافة هدف جديد لتتبع تقدمك
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.map(goal => {
              const stats = computeStats(goal);
              const isFinancial = goal.type === "financial";
              
              return (
                <div
                  key={goal.id}
                  className="rounded-2xl border bg-white/82 p-4"
                  style={{
                    borderColor: "rgba(201,160,99,0.24)",
                    boxShadow: "0 14px 34px rgba(138,107,61,0.10)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                        background: "linear-gradient(135deg, hsl(36 72% 52% / 0.15), hsl(36 72% 52% / 0.05))",
                        border: "1px solid hsl(36 72% 52% / 0.3)",
                      }}>
                        <Target className="w-5 h-5" style={{ color: "#C9A063" }} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[16px]" style={{ color: "#2F2B25" }}>
                          {goal.name}
                        </h3>
                        <span className="text-xs font-medium" style={{ color: "#6F6557" }}>
                          {isFinancial ? "هدف مالي" : "هدف غير مالي"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => openEdit(goal)}
                      >
                        <Edit2 className="w-4 h-4" style={{ color: "#6F6557" }} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => { setDeletingGoalId(goal.id); setIsDeleteOpen(true); }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  {isFinancial && goal.targetAmount ? (
                    <>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium" style={{ color: "#6F6557" }}>
                            {goal.currentProgress.toLocaleString()} / {goal.targetAmount.toLocaleString()} ريال
                          </span>
                          <span className="font-bold" style={{ color: "#8A6B3D" }}>
                            {stats.progressPercent}%
                          </span>
                        </div>
                        <Progress 
                          value={stats.progressPercent} 
                          className="h-2"
                          style={{
                            '--progress-background': 'linear-gradient(90deg, #C9A063, #E3C383)',
                          } as React.CSSProperties}
                        />
                      </div>
                      
                      {stats.remaining && stats.remaining > 0 && (
                        <div className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: "#F3E8D6/50" }}>
                          <TrendingUp className="w-4 h-4" style={{ color: "#8A6B3D" }} />
                          <span style={{ color: "#6F6557" }}>
                            متبقي: {stats.remaining.toLocaleString()} ريال
                            {stats.dailyNeeded && ` • تحتاج ${Math.round(stats.dailyNeeded).toLocaleString()} ريال/يوم`}
                          </span>
                        </div>
                      )}
                    </>
                  ) : goal.requirements ? (
                    <p className="text-sm" style={{ color: "#6F6557" }}>
                      {goal.requirements}
                    </p>
                  ) : null}
                  
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(201,160,99,0.15)" }}>
                    <div className="flex items-center gap-1 text-xs" style={{ color: "#6F6557" }}>
                      <Calendar className="w-3 h-3" />
                      {goal.deadline ? new Date(goal.deadline).toLocaleDateString("ar-SA") : "بدون موعد"}
                    </div>
                    
                    <Button
                      size="sm"
                      className="h-8 text-xs font-bold"
                      onClick={() => { setCompletingGoalId(goal.id); setIsCompleteOpen(true); }}
                      style={{
                        background: "linear-gradient(135deg, hsl(142 60% 45%), hsl(142 60% 38%))",
                      }}
                    >
                      <Check className="w-3 h-3 ml-1" />
                      أكمل الهدف
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-[16px]" style={{ color: "#8A6B3D" }}>
              الأهداف المكتملة
            </h3>
            {completedGoals.map(goal => (
              <div
                key={goal.id}
                className="rounded-2xl border bg-green-50/50 p-4 opacity-70"
                style={{ borderColor: "rgba(34, 197, 94, 0.3)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm line-through" style={{ color: "#6F6557" }}>
                      {goal.name}
                    </h4>
                    <p className="text-xs" style={{ color: "#6F6557" }}>
                      أكمل في: {new Date(goal.completedAt!).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => { setDeletingGoalId(goal.id); setIsDeleteOpen(true); }}
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
          title="حذف الهدف"
          description="هل أنت متأكد من حذف هذا الهدف؟ لا يمكن التراجع."
          confirmText="حذف"
          onConfirm={handleDelete}
          destructive
        />
        
        {/* Complete Confirm */}
        <ConfirmDialog
          open={isCompleteOpen}
          onOpenChange={setIsCompleteOpen}
          title="إكمال الهدف"
          description="هل أنت متأكد من إكمال هذا الهدف؟"
          confirmText="نعم، أكمل"
          onConfirm={handleComplete}
        />
        
        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل الهدف</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>اسم الهدف *</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>نوع الهدف</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as GoalType)}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent className="rtl">
                    <SelectItem value="financial">مالي</SelectItem>
                    <SelectItem value="non-financial">غير مالي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formType === "financial" && (
                <>
                  <div className="space-y-2">
                    <Label>المبلغ المستهدف *</Label>
                    <Input type="number" value={formTargetAmount} onChange={e => setFormTargetAmount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>التقدم الحالي</Label>
                    <Input type="number" value={formCurrentProgress} onChange={e => setFormCurrentProgress(e.target.value)} />
                  </div>
                </>
              )}
              
              {formType === "non-financial" && (
                <div className="space-y-2">
                  <Label>المتطلبات</Label>
                  <Textarea value={formRequirements} onChange={e => setFormRequirements(e.target.value)} rows={3} />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>الموعد النهائي</Label>
                <Input type="date" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} />
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
