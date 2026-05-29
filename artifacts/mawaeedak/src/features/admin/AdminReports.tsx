import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useListAuditLogs } from "@workspace/api-client-react";
import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminReports() {
  const [search, setSearch] = useState("");
  const { data: logs, isLoading } = useListAuditLogs({ limit: 100 });

  const filteredLogs = logs?.filter(log => 
    !search || 
    log.action.toLowerCase().includes(search.toLowerCase()) || 
    log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    (log.entity_name && log.entity_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">تقارير النظام</h2>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="بحث في سجلات النظام..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right rtl">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">العملية</th>
                  <th className="px-4 py-3 font-medium">العنصر</th>
                  <th className="px-4 py-3 font-medium">المستخدم</th>
                  <th className="px-4 py-3 font-medium">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" /></td>
                  </tr>
                ) : filteredLogs && filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-600' :
                          log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{log.entity_name || '-'}</div>
                        <div className="text-[10px] text-muted-foreground">{log.entity_type}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{log.performed_by}</td>
                      <td className="px-4 py-3 text-muted-foreground dir-ltr text-right">{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">لا توجد سجلات</td>
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
