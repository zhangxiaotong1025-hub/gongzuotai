import { useState, useCallback } from "react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X } from "lucide-react";

/* ── Types ── */
type DataType = "COUNTER" | "BOOLEAN" | "STORAGE" | "DURATION";
interface Capability {
  id: string;
  name: string;
  code: string;
  appName: string;
  dataType: DataType;
  unit: string;
  apiPath: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

/* ── Constants ── */
const DATA_TYPES: { value: DataType; label: string; unit: string }[] = [
  { value: "COUNTER", label: "次数计量", unit: "次" },
  { value: "BOOLEAN", label: "布尔型", unit: "布尔" },
  { value: "STORAGE", label: "存储计量", unit: "MB" },
  { value: "DURATION", label: "时长计量", unit: "分钟" },
];

const APPS = ["国内3D设计工具", "国际3D设计工具", "AI App", "智能导购"];

/* ── Mock Data ── */
const initialData: Capability[] = [
  { id: "1", name: "AI设计", code: "ai_design", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/ai/design", description: "AI智能设计能力，支持自动生成设计方案", status: "active", createdAt: "2026-03-10" },
  { id: "2", name: "3D渲染", code: "3d_render", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/render/3d", description: "高性能3D场景渲染服务", status: "active", createdAt: "2026-03-10" },
  { id: "3", name: "模型下载", code: "model_download", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/model/download", description: "3D模型资源下载服务", status: "active", createdAt: "2026-03-10" },
  { id: "4", name: "AI配色", code: "ai_color", appName: "AI App", dataType: "COUNTER", unit: "次", apiPath: "/api/ai/color", description: "AI智能配色建议服务", status: "inactive", createdAt: "2026-03-11" },
  { id: "5", name: "智能排版", code: "smart_layout", appName: "AI App", dataType: "DURATION", unit: "tokens", apiPath: "/api/ai/layout", description: "自动智能排版布局生成", status: "active", createdAt: "2026-03-11" },
  { id: "6", name: "素材库", code: "material_library", appName: "国内3D设计工具", dataType: "BOOLEAN", unit: "布尔", apiPath: "/api/material/library", description: "海量设计素材资源库访问", status: "active", createdAt: "2026-03-11" },
  { id: "7", name: "4K渲染", code: "render_4k", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/render/4k", description: "4K分辨率高清渲染", status: "active", createdAt: "2026-03-10" },
  { id: "8", name: "8K渲染", code: "render_8k", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/render/8k", description: "8K超清渲染", status: "active", createdAt: "2026-03-10" },
  { id: "9", name: "云存储", code: "cloud_storage", appName: "国内3D设计工具", dataType: "STORAGE", unit: "MB", apiPath: "/api/storage", description: "云端文件存储服务", status: "active", createdAt: "2026-03-12" },
  { id: "10", name: "全景图导出", code: "export_panorama", appName: "国内3D设计工具", dataType: "COUNTER", unit: "次", apiPath: "/api/export/panorama", description: "全景图导出功能", status: "active", createdAt: "2026-03-10" },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: "启用", className: "badge-active" },
  inactive: { label: "停用", className: "badge-inactive" },
};

const DATA_TYPE_MAP: Record<string, string> = {
  COUNTER: "次数计量", BOOLEAN: "布尔型", STORAGE: "存储计量", DURATION: "时长计量",
};

const filterFields: FilterField[] = [
  { key: "name", label: "能力名称/编码", type: "input", placeholder: "请输入能力名称或编码", width: 220 },
  { key: "dataType", label: "计量类型", type: "select", options: DATA_TYPES.map((t) => ({ label: t.label, value: t.value })), width: 140 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 120 },
];

const columns: TableColumn<Capability>[] = [
  { key: "code", title: "能力编码", minWidth: 140, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
  { key: "name", title: "能力名称", minWidth: 120, render: (v) => <span className="text-foreground font-medium">{v}</span> },
  { key: "description", title: "描述", minWidth: 260, render: (v) => <span className="text-muted-foreground block max-w-[260px] truncate" title={v}>{v}</span> },
  { key: "unit", title: "计量单位", minWidth: 80 },
  { key: "dataType", title: "类型", minWidth: 90, render: (v: string) => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{DATA_TYPE_MAP[v]}</span> },
  { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
  { key: "createdAt", title: "创建时间", minWidth: 110, render: (v) => <span className="text-muted-foreground">{v}</span> },
];

/* ── Dialog ── */
function CapDialog({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Capability | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "", appName: initial?.appName || APPS[0],
    dataType: (initial?.dataType || "COUNTER") as DataType, unit: initial?.unit || "次",
    apiPath: initial?.apiPath || "", description: initial?.description || "",
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑能力" : "新建能力"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">定义平台可售卖的技术能力</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">能力名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" placeholder="如：AI设计" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">能力编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" placeholder="如：ai_design" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })}>
                {APPS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">数据类型 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.dataType} onChange={(e) => {
                const dt = e.target.value as DataType;
                const u = DATA_TYPES.find((t) => t.value === dt)?.unit || "";
                setForm({ ...form, dataType: dt, unit: u });
              }}>
                {DATA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计量单位</label>
              <input className="filter-input w-full" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">调用接口</label>
              <input className="filter-input w-full font-mono text-[12px]" placeholder="/api/..." value={form.apiPath} onChange={(e) => setForm({ ...form, apiPath: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">能力描述</label>
            <textarea className="filter-input w-full min-h-[60px] resize-y" placeholder="能力说明..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim()} onClick={() => onSave(form)}>
            {isEdit ? "保存" : "创建"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function CapabilityList() {
  const [data, setData] = useState<Capability[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Capability | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("能力已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, status: "active", createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("能力已创建");
    }
    setDialogOpen(false);
    setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: Capability) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    toast.success(item.status === "active" ? "已停用" : "已启用");
  }, []);

  const actions: ActionItem<Capability>[] = [
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => { setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除"); } },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="能力管理"
        subtitle="管理平台的能力配置，包括AI模型、渲染引擎等服务能力"
        actions={
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
            <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
          </div>
        }
      />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={3} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} />
      </div>
      <CapDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
