import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X } from "lucide-react";
import { capabilityData as initialData, appData, ruleData, DATA_TYPES, STATUS_MAP, type Capability, type DataType, getApp } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "name", label: "能力名称/编码", type: "input", placeholder: "请输入", width: 220 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "dataType", label: "数据类型", type: "select", options: DATA_TYPES.map((t) => ({ label: t.label.split("（")[0], value: t.value })), width: 120 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 100 },
];

function CapDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Capability | null }) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initial?.appId || appData[0]?.id,
    dataType: (initial?.dataType || "COUNTER") as DataType,
    unit: initial?.unit || "次",
    apiPath: initial?.apiPath || "",
    consumePerUse: initial?.consumePerUse ?? 1,
    description: initial?.description || "",
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  // 数据类型变更时自动设置默认单位
  const handleDataTypeChange = (dt: DataType) => {
    const unitMap: Record<DataType, string> = { COUNTER: "次", BOOLEAN: "布尔", STORAGE: "MB", DURATION: "秒" };
    setForm({ ...form, dataType: dt, unit: unitMap[dt] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[560px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑能力" : "新建能力"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">定义最底层技术能力，只定义"做什么"</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">能力名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">能力编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" placeholder="如：AI_DESIGN" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.appId} onChange={(e) => setForm({ ...form, appId: e.target.value })}>
              {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">数据类型 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.dataType} onChange={(e) => handleDataTypeChange(e.target.value as DataType)}>
                {DATA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计量单位 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">默认消耗</label>
              <input type="number" min={1} className="filter-input w-full" value={form.consumePerUse} onChange={(e) => setForm({ ...form, consumePerUse: Math.max(1, Number(e.target.value)) })} />
              <p className="text-[11px] text-muted-foreground/70">每次调用消耗量</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">调用接口</label>
            <input className="filter-input w-full font-mono text-[12px]" placeholder="/api/ai/design" value={form.apiPath} onChange={(e) => setForm({ ...form, apiPath: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">能力描述</label>
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

export default function CapabilityList() {
  const navigate = useNavigate();
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
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: Capability) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    toast.success(item.status === "active" ? "已停用" : "已启用");
  }, []);

  const columns: TableColumn<Capability>[] = [
    { key: "name", title: "能力名称", minWidth: 120, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/capability/detail/${(row as Capability).id}`)}>{v}</button> },
    { key: "code", title: "编码", minWidth: 160, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
    { key: "appId", title: "所属应用", minWidth: 120, render: (v: string) => { const app = getApp(v); return app ? <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20" onClick={() => navigate(`/entitlement/app/detail/${v}`)}>{app.name}</button> : <span>—</span>; } },
    { key: "dataType", title: "数据类型", minWidth: 100, render: (v: string) => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{DATA_TYPES.find((t) => t.value === v)?.label.split("（")[0] || v}</span> },
    { key: "unit", title: "单位", minWidth: 60, render: (v) => <span className="text-muted-foreground">{v}</span> },
    { key: "apiPath", title: "接口", minWidth: 160, render: (v) => v ? <code className="text-[11px] text-muted-foreground font-mono">{v}</code> : <span className="text-muted-foreground">—</span> },
    {
      key: "id", title: "规则数", minWidth: 60, align: "center" as const,
      render: (_v, row) => {
        const count = ruleData.filter((r) => r.capabilityId === (row as Capability).id).length;
        return <span className={count > 0 ? "text-primary font-medium" : "text-muted-foreground"}>{count}</span>;
      },
    },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
  ];

  const actions: ActionItem<Capability>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/capability/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => { setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除"); } },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="能力管理" subtitle="定义最底层技术能力，只定义"做什么"，不定义计费规则" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={4} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}><Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} /></div>
      <CapDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
