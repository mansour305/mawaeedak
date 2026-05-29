/**
 * AdminNewsJobs — Phase 12L
 *
 * Read:   useGatewayNews / useGatewayJobs → API (mode=api/shadow) | Supabase (mode=supabase)
 * Write:  gwCreate/Update/Delete News/Job
 *           mode=api/shadow → POST/PATCH/DELETE /api/news | /api/jobs
 *           mode=supabase   → Supabase INSERT/UPDATE/DELETE
 *           لا fallback صامت — كل فشل يُعرض toast واضح
 *
 * Invalidation بعد كل write:
 *   - gwQueryKeys.news / gwQueryKeys.jobs → يُعيد جلب Gateway cache
 *   - getListNewsQueryKey / getListJobsQueryKey → Orval compat
 *
 * IDs:
 *   - news.id = integer مباشر (row.id في Supabase = نفس API id)
 *   - jobs.id = integer مباشر (نفس الأمر)
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/layout/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListNewsQueryKey,
  getListJobsQueryKey,
} from "@workspace/api-client-react";
import { Plus, Edit2, Trash2, Loader2, Newspaper, Briefcase } from "lucide-react";
import { useGatewayNews, useGatewayJobs, gwQueryKeys } from "@/hooks/useGatewayData";
import {
  gwCreateNews,
  gwUpdateNews,
  gwDeleteNews,
  gwCreateJob,
  gwUpdateJob,
  gwDeleteJob,
} from "@/lib/dataGateway";

export default function AdminNewsJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Phase 12L: Gateway read
  const { data: news, isLoading: newsLoading, refetch: refetchNews } = useGatewayNews();
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useGatewayJobs();

  // Pending states for gateway mutations
  const [newsPending, setNewsPending] = useState(false);
  const [jobPending, setJobPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  // Dialogs
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isJobOpen, setIsJobOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"news" | "job" | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // News Form
  const [newsTitle, setNewsTitle] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [newsCat, setNewsCat] = useState("عام");
  const [newsSource, setNewsSource] = useState("");
  const [newsActive, setNewsActive] = useState(true);

  // Job Form
  const [jobTitle, setJobTitle] = useState("");
  const [jobEmployer, setJobEmployer] = useState("");
  const [jobSector, setJobSector] = useState("خاص");
  const [jobCity, setJobCity] = useState("الرياض");
  const [jobUrl, setJobUrl] = useState("");
  const [jobActive, setJobActive] = useState(true);

  // Invalidation بعد كل write
  const invalidateNews = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.news });
    queryClient.invalidateQueries({ queryKey: getListNewsQueryKey() });
    void refetchNews();
  };
  const invalidateJobs = () => {
    queryClient.invalidateQueries({ queryKey: gwQueryKeys.jobs });
    queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
    void refetchJobs();
  };

  const openNewsAdd = () => {
    setIsEdit(false); setEditId(null);
    setNewsTitle(""); setNewsBody(""); setNewsCat("عام"); setNewsSource(""); setNewsActive(true);
    setIsNewsOpen(true);
  };

  const openNewsEdit = (item: { id: number; title: string; body?: string | null; category: string; source?: string | null; is_published: boolean }) => {
    setIsEdit(true); setEditId(item.id);
    setNewsTitle(item.title); setNewsBody(item.body ?? ""); setNewsCat(item.category);
    setNewsSource(item.source ?? ""); setNewsActive(item.is_published);
    setIsNewsOpen(true);
  };

  const openJobAdd = () => {
    setIsEdit(false); setEditId(null);
    setJobTitle(""); setJobEmployer(""); setJobSector("خاص"); setJobCity("الرياض");
    setJobUrl(""); setJobActive(true);
    setIsJobOpen(true);
  };

  const openJobEdit = (item: { id: number; title: string; employer: string; sector: string; city: string; apply_url?: string | null; is_active?: boolean }) => {
    setIsEdit(true); setEditId(item.id);
    setJobTitle(item.title); setJobEmployer(item.employer); setJobSector(item.sector);
    setJobCity(item.city); setJobUrl(item.apply_url ?? ""); setJobActive(item.is_active ?? true);
    setIsJobOpen(true);
  };

  const handleNewsSave = async () => {
    if (!newsTitle) return;
    const payload = {
      title: newsTitle,
      body: newsBody || undefined,
      category: newsCat,
      source: newsSource || undefined,
      is_published: newsActive,
    };
    setNewsPending(true);
    try {
      const result = isEdit && editId
        ? await gwUpdateNews(editId, payload)
        : await gwCreateNews(payload);
      if (result.success) {
        toast({ title: isEdit ? "تم التعديل" : "تمت الإضافة" });
        setIsNewsOpen(false);
        invalidateNews();
      } else {
        toast({ title: "خطأ", description: result.error ?? "فشلت العملية", variant: "destructive" });
      }
    } finally {
      setNewsPending(false);
    }
  };

  const handleJobSave = async () => {
    if (!jobTitle || !jobEmployer) return;
    const payload = {
      title: jobTitle,
      employer: jobEmployer,
      sector: jobSector,
      city: jobCity,
      apply_url: jobUrl || undefined,
      is_active: jobActive,
    };
    setJobPending(true);
    try {
      const result = isEdit && editId
        ? await gwUpdateJob(editId, payload)
        : await gwCreateJob(payload);
      if (result.success) {
        toast({ title: isEdit ? "تم التعديل" : "تمت الإضافة" });
        setIsJobOpen(false);
        invalidateJobs();
      } else {
        toast({ title: "خطأ", description: result.error ?? "فشلت العملية", variant: "destructive" });
      }
    } finally {
      setJobPending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    setDeletePending(true);
    try {
      const result = deleteType === "news"
        ? await gwDeleteNews(deleteId)
        : await gwDeleteJob(deleteId);
      if (result.success) {
        toast({ title: "تم الحذف" });
        setIsDeleteOpen(false);
        if (deleteType === "news") invalidateNews();
        else invalidateJobs();
      } else {
        toast({ title: "خطأ في الحذف", description: result.error ?? "فشل الحذف", variant: "destructive" });
        setIsDeleteOpen(false);
      }
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">الأخبار والوظائف</h2>

      <Tabs defaultValue="news" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="news">الأخبار</TabsTrigger>
          <TabsTrigger value="jobs">الوظائف</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openNewsAdd} size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة خبر</Button>
          </div>
          {newsLoading
            ? <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            : (news ?? []).map(item => (
              <Card key={item.id} className={`border-border ${!item.is_published ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold flex items-center gap-2">
                      <Newspaper className="w-4 h-4 text-primary" /> {item.title}
                    </h4>
                    <div className="text-xs text-muted-foreground mt-1">{item.category} • {item.source}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openNewsEdit(item)}><Edit2 className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeleteType("news"); setDeleteId(item.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openJobAdd} size="sm"><Plus className="w-4 h-4 ml-1" /> إضافة وظيفة</Button>
          </div>
          {jobsLoading
            ? <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            : (jobs ?? []).map(item => (
              <Card key={item.id} className={`border-border ${!item.is_active ? "opacity-60" : ""}`}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" /> {item.title}
                    </h4>
                    <div className="text-xs text-muted-foreground mt-1">{item.employer} • {item.city}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openJobEdit(item)}><Edit2 className="w-4 h-4 text-primary" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setDeleteType("job"); setDeleteId(item.id); setIsDeleteOpen(true); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* News Dialog */}
      <Dialog open={isNewsOpen} onOpenChange={setIsNewsOpen}>
        <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{isEdit ? "تعديل الخبر" : "خبر جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>العنوان</Label><Input value={newsTitle} onChange={e => setNewsTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>التفاصيل</Label><Textarea value={newsBody} onChange={e => setNewsBody(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>التصنيف</Label><Input value={newsCat} onChange={e => setNewsCat(e.target.value)} /></div>
              <div className="space-y-2"><Label>المصدر</Label><Input value={newsSource} onChange={e => setNewsSource(e.target.value)} /></div>
            </div>
            <div className="flex items-center justify-between"><Label>منشور</Label><Switch checked={newsActive} onCheckedChange={setNewsActive} /></div>
            <Button className="w-full" onClick={handleNewsSave} disabled={newsPending}>
              {newsPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Job Dialog */}
      <Dialog open={isJobOpen} onOpenChange={setIsJobOpen}>
        <DialogContent className="rtl max-w-[400px] rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{isEdit ? "تعديل الوظيفة" : "وظيفة جديدة"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>المسمى الوظيفي</Label><Input value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>جهة التوظيف</Label><Input value={jobEmployer} onChange={e => setJobEmployer(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>المدينة</Label><Input value={jobCity} onChange={e => setJobCity(e.target.value)} /></div>
              <div className="space-y-2"><Label>القطاع</Label><Input value={jobSector} onChange={e => setJobSector(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>رابط التقديم</Label><Input value={jobUrl} onChange={e => setJobUrl(e.target.value)} dir="ltr" /></div>
            <div className="flex items-center justify-between"><Label>متاحة</Label><Switch checked={jobActive} onCheckedChange={setJobActive} /></div>
            <Button className="w-full" onClick={handleJobSave} disabled={jobPending}>
              {jobPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="تأكيد الحذف"
        description="هل أنت متأكد؟"
        onConfirm={handleDelete}
      />
    </div>
  );
}
