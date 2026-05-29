import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { Briefcase, CheckCircle2, Circle, Plus, Trash2, Edit2, Clock, Users, FolderKanban, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "mawaeedak_work_tasks_v1";

type TaskType = "task" | "meeting" | "project" | "followup";
type TaskStatus = "pending" | "completed";
type FilterTab = "all" | "pending" | "completed";

interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
}

const TYPE_LABELS: Record<TaskType, string> = {
  task: "مهمة",
  meeting: "اجتماع",
  project: "مشروع",
  followup: "متابعة",
};

const TYPE_ICONS: Record<TaskType, typeof Briefcase> = {
  task: Briefcase,
  meeting: Users,
  project: FolderKanban,
  followup: RefreshCw,
};

const TYPE_COLORS: Record<TaskType, string> = {
  task: "text-amber-600 bg-amber-500/10",
  meeting: "text-blue-600 bg-blue-500/10",
  project: "text-violet-600 bg-violet-500/10",
  followup: "text-emerald-600 bg-emerald-500/10",
};

function loadTasks(): Task[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export default function CentersWorkPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("task");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const openAdd = () => {
    setEditId(null);
    setTitle("");
    setType("task");
    setDueDate("");
    setIsFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditId(task.id);
    setTitle(task.title);
    setType(task.type);
    setDueDate(task.dueDate || "");
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast({ title: "خطأ", description: "عنوان المهمة مطلوب", variant: "destructive" });
      return;
    }
    if (editId) {
      setTasks(prev => prev.map(t => t.id === editId ? { ...t, title: title.trim(), type, dueDate } : t));
      toast({ title: "تم التعديل" });
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        title: title.trim(),
        type,
        status: "pending",
        dueDate,
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
      toast({ title: "تمت الإضافة" });
    }
    setIsFormOpen(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === "completed" ? "pending" : "completed" } : t
    ));
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setTasks(prev => prev.filter(t => t.id !== deleteId));
    setDeleteId(null);
    toast({ title: "تم الحذف" });
  };

  const filtered = tasks.filter(t => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const pendingCount = tasks.filter(t => t.status === "pending").length;
  const completedCount = tasks.filter(t => t.status === "completed").length;

  return (
    <AppShell title="مركز الأعمال" showBack>
      <div className="space-y-4">

        {/* Header */}
        <Card className="border-border shadow-sm bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">مساحة العمل</h2>
                <p className="text-xs text-muted-foreground">
                  {pendingCount} قيد التنفيذ · {completedCount} مكتملة
                </p>
              </div>
            </div>
            <Button size="sm" className="h-9 rounded-xl" onClick={openAdd}>
              <Plus className="w-4 h-4 ml-1" />
              إضافة
            </Button>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(["all", "pending", "completed"] as FilterTab[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {f === "all" ? `الكل (${tasks.length})` : f === "pending" ? `قيد التنفيذ (${pendingCount})` : `مكتملة (${completedCount})`}
            </button>
          ))}
        </div>

        {/* Task List */}
        {filtered.length > 0 ? (
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {filtered.map(task => {
                const TypeIcon = TYPE_ICONS[task.type];
                const isOverdue = task.dueDate && task.status === "pending" && new Date(task.dueDate) < new Date();
                return (
                  <div key={task.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm leading-tight ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[task.type]}`}>
                          <TypeIcon className="w-2.5 h-2.5" />
                          {TYPE_LABELS[task.type]}
                        </span>
                        {task.dueDate && (
                          <span className={`text-[10px] ${isOverdue ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                            <Clock className="w-2.5 h-2.5 inline ml-0.5" />
                            {new Date(task.dueDate).toLocaleDateString("ar-SA-u-ca-gregory")}
                            {isOverdue && " (متأخر)"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-0.5 shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEdit(task)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(task.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">
              {filter === "completed" ? "لا توجد مهام مكتملة" : filter === "pending" ? "لا توجد مهام قيد التنفيذ" : "لا توجد مهام — أضف أولى مهامك!"}
            </p>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="rtl max-w-[400px] rounded-xl">
            <DialogHeader>
              <DialogTitle>{editId ? "تعديل المهمة" : "إضافة مهمة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>عنوان المهمة <span className="text-destructive">*</span></Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                  placeholder="مثال: مراجعة تقرير المبيعات"
                />
              </div>
              <div className="space-y-2">
                <Label>النوع</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(TYPE_LABELS) as [TaskType, string][]).map(([k, v]) => {
                    const Icon = TYPE_ICONS[k];
                    return (
                      <button
                        key={k}
                        onClick={() => setType(k)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                          type === k ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>تاريخ التسليم (اختياري)</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  dir="ltr"
                />
              </div>
              <Button className="w-full h-11 font-bold" onClick={handleSave}>
                {editId ? "حفظ التعديلات" : "إضافة المهمة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={open => !open && setDeleteId(null)}
          title="حذف المهمة"
          description="هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء."
          confirmText="حذف"
          onConfirm={handleDelete}
          destructive
        />
      </div>
    </AppShell>
  );
}
