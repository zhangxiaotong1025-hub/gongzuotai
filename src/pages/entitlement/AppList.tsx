import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X } from "lucide-react";
import { appData as initialData, getCapabilitiesByApp, getProductsByApp, type AppItem, STATUS_MAP } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "name", label: "应用名称/编码", type: "input", placeholder: "请输入", width: 220 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
];

function AppDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: AppItem | null }) {
  const [form, setForm] = useState({ name: initial?.name || "", code: initial?.code || "", description: initial?.description || "" });
  const isEdit = Boolean(initial);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[520px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑应用" : "新建应用"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">定义平台的应用产品，用于隔离不同产品线的商业模型</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">应用名称 <span className="text-destructive">*</span></label>
            <input className="filter-input w-full" placeholder="如：国内3D设计工具" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">应用编码 <span className="text-destructive">*</span></label>
            <input className="filter-input w-full font-mono" placeholder="如：DOMESTIC_3D" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            {isEdit && <p className="text-[11px] text-muted-foreground/70">编码创建后不可修改</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">应用描述</label>
            <textarea className="filter-input w-full min-h-[60px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim()} onClick={() => onSave(form)}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}

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
    { key: "id", title: "关联能力", minWidth: 80, align: "center" as const, render: (_v, row) => <span className="text-primary font-medium">{getCapabilitiesByApp((row as AppItem).id).length}个</span> },
    { key: "updatedAt", title: "权益产品", minWidth: 80, align: "center" as const, render: (_v, row) => <span className="text-primary font-medium">{getProductsByApp((row as AppItem).id).length}个</span> },
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
