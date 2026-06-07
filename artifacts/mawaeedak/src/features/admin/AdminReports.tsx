import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListAuditLogs } from "@workspace/api-client-react";
import { Search, Loader2, Download, FileSpreadsheet, Calendar } from "lucide-react";
import { format } from "date-fns";

const TIME_FILTERS = [
  { value: "7d", label: "آخر 7 أيام" },
  { value: "30d", label: "آخر 30 يوم" },
  { value: "90d", label: "آخر 90 يوم" },
  { value: "all", label: "كل السجلات" },
];

export default function AdminReports() {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState("30d");
  const [exporting, setExporting] = useState(false);
  const { data: logs, isLoading } = useListAuditLogs({ limit: 500 });

  const filteredLogs = useMemo(() => {
    const cutoff = new Date();
    if (timeFilter === "7d") cutoff.setDate(cutoff.getDate() - 7);
    else if (timeFilter === "30d") cutoff.setDate(cutoff.getDate() - 30);
    else if (timeFilter === "90d") cutoff.setDate(cutoff.getDate() - 90);
    else cutoff.setFullYear(2000);

    return (logs ?? []).filter(log => {
      const logDate = new Date(log.created_at);
      if (logDate < cutoff) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.entity_type.toLowerCase().includes(q) ||
        (log.entity_name && log.entity_name.toLowerCase().includes(q)) ||
        (log.performed_by && log.performed_by.toLowerCase().includes(q))
      );
    });
  }, [logs, search, timeFilter]);

  const stats = useMemo(() => {
    const creates = filteredLogs.filter(l => l.action === "CREATE").length;
    const updates = filteredLogs.filter(l => l.action === "UPDATE").length;
    const deletes = filteredLogs.filter(l => l.action === "DELETE").length;
    return { creates, updates, deletes, total: filteredLogs.length };
  }, [filteredLogs]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;
    setExporting(true);
    try {
      const headers = ["التاريخ", "العملية", "العنصر", "النوع", "المستخدم"];
      const rows = filteredLogs.map(log => [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm"),
        log.action,
        log.entity_name ?? "-",
        log.entity_type,
        log.performed_by,
      ]);
      const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold">تقارير النظام</h2>
        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={exporting || filteredLogs.length === 0}>
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 ml-1" />}
          <FileSpreadsheet className="w-4 h-4 ml-1" /> تصدير CSV
        </Button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي العمليات", value: stats.total, color: "text-primary" },
          { label: "إضافات", value: stats.creates, color: "text-emerald-600" },
          { label: "تعديلات", value: stats.updates, color: "text-blue-600" },
          { label: "حذف", value: stats.deletes, color: "text-red-600" },
        ].map(s => (
          <Card key={s.label} className="border-border shadow-sm">
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في السجلات..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent className="rtl">
            {TIME_FILTERS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right rtl">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">التاريخ</th>
                  <th className="px-4 py-3 font-medium">العملية</th>
                  <th className="px-4 py-3 font-medium">العنصر</th>
                  <th className="px-4 py-3 font-medium">النوع</th>
                  <th className="px-4 py-3 font-medium">المستخدم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground dir-ltr text-right">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(log.created_at), "yyyy-MM-dd")}</div>
                        <div className="text-[10px]">{format(new Date(log.created_at), "HH:mm")}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          log.action === "CREATE" ? "bg-emerald-500/10 text-emerald-600" :
                          log.action === "UPDATE" ? "bg-blue-500/10 text-blue-600" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{log.entity_name || "-"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.entity_type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.performed_by}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد سجلات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
