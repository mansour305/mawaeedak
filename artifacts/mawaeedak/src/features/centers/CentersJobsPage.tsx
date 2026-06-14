import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Briefcase, Search, MapPin, ExternalLink, Loader2, Clock } from "lucide-react";
import { useGatewayJobs } from "@/hooks/useGatewayData";

export default function CentersJobsPage() {
  // Phase 12H: gateway hook — يقرأ من Supabase عند mode=supabase، API عند mode=api
  // الكتابة: لا يوجد mutations في هذه الصفحة (read-only)
  const { data: jobs, isLoading } = useGatewayJobs();
  const [search, setSearch] = useState("");

  const filtered = (jobs ?? [])
    .filter(j => j.is_active)
    .filter(j => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        (j.city ?? "").toLowerCase().includes(q) ||
        (j.employer ?? "").toLowerCase().includes(q) ||
        (j.sector ?? "").toLowerCase().includes(q)
      );
    });

  const daysUntil = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  return (
    <AppShell title="مركز الوظائف" showBack>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالمسمى أو المدينة أو الجهة..."
            className="pr-9 h-12 rounded-xl bg-card"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((job) => {
              const days = daysUntil(job.deadline);
              const isUrgent = days !== null && days <= 3;
              return (
                <Card
                  key={job.id}
                  className={`border-border shadow-sm hover:shadow-md transition-shadow ${isUrgent ? "border-r-4 border-r-red-500" : ""}`}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground leading-tight">{job.title}</h3>
                          <div className="text-sm font-medium text-primary mt-0.5">{job.employer}</div>
                        </div>
                      </div>
                      {days !== null && (
                        <div className={`text-center shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${isUrgent ? "bg-red-500/10 text-red-600" : "bg-muted text-muted-foreground"}`}>
                          <Clock className="w-3 h-3 inline ml-0.5" />
                          {days > 0 ? `${days} يوم` : days === 0 ? "اليوم آخر يوم" : "انتهى"}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.city && (
                        <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                          <MapPin className="w-3 h-3" /> {job.city}
                        </span>
                      )}
                      {job.sector && (
                        <span className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md">
                          {job.sector}
                        </span>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
                    )}

                    {job.apply_url && (
                      <Button
                        className="w-full h-10 font-bold"
                        onClick={() => window.open(job.apply_url ?? undefined, "_blank")}
                      >
                        تقديم الآن <ExternalLink className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            لا توجد نتائج للبحث عن "{search}"
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">لا توجد وظائف حالياً</div>
        )}
      </div>
    </AppShell>
  );
}

