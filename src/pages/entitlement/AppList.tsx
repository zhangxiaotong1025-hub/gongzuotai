import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download } from "lucide-react";
import { appData as initialData, getCapabilitiesByApp, getRulesByApp, type AppItem, STATUS_MAP } from "@/data/entitlement";
import { AppDialog } from "./dialogs/AppDialog";

const filterFields: FilterField[] = [
  { key: "name", label: "应用名称/编码", type: "input", placeholder: "请输入", width: 220 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
];

export default function AppList() {
  const navigate = useNavigate();
  const [data, setData] = useState<AppItem[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AppItem | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form, updatedAt: new Date().toLocaleDateString("zh-CN") } : a));
      toast.success("应用已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, status: "active", createdAt: new Date().toLocaleDateString("zh-CN"), updatedAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("应用已创建");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: AppItem) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    toast.success(item.status === "active" ? "已停用" : "已启用");
  }, []);

  const columns: TableColumn<AppItem>[] = [
    { key: "name", title: "应用名称", minWidth: 180, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/app/detail/${(row as AppItem).id}`)}>{v}</button> },
    { key: "code", title: "应用编码", minWidth: 140, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
    { key: "description", title: "描述", minWidth: 200, render: (v) => <span className="text-muted-foreground">{v || "—"}</span> },
    { key: "id", title: "能力", minWidth: 60, align: "center" as const, render: (_v, row) => <span className="text-primary font-medium">{getCapabilitiesByApp((row as AppItem).id).length}</span> },
    { key: "updatedAt", title: "规则", minWidth: 60, align: "center" as const, render: (_v, row) => <span className="text-primary font-medium">{getRulesByApp((row as AppItem).id).length}</span> },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
    { key: "createdAt", title: "创建时间", minWidth: 110, render: (v) => <span className="text-muted-foreground">{v}</span> },
  ];

  const actions: ActionItem<AppItem>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/app/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => { setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除"); } },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="应用管理" subtitle="定义平台的应用产品，用于隔离不同产品线的商业模型" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={3} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}><Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} /></div>
      <AppDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
