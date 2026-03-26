import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X } from "lucide-react";
import { entitlementProductData as initialData, appData, capabilityData, meteringRuleData, skuData, PERIOD_TYPES, STATUS_MAP, type EntitlementProduct, type PeriodType, getSkuRefCount, getCapabilitiesByApp, getRulesByCapability } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "name", label: "规则名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "appId", label: "所属应用", type: "select", options: appData.map((a) => ({ label: a.name, value: a.id })), width: 160 },
  { key: "capabilityId", label: "关联能力", type: "select", options: capabilityData.map((c) => ({ label: c.name, value: c.id })), width: 140 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 100 },
];

function RuleDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: EntitlementProduct | null }) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initial?.appId || appData[0]?.id, appName: initial?.appName || appData[0]?.name,
    capabilityId: initial?.capabilityId || "", capabilityName: initial?.capabilityName || "",
    meteringRuleId: initial?.meteringRuleId || "", meteringRuleName: initial?.meteringRuleName || "",
    quota: initial?.quota || 100,
    period: (initial?.period || "daily") as PeriodType,
    validDays: initial?.validDays ?? 30,
    description: initial?.description || "",
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  const availableCaps = getCapabilitiesByApp(form.appId);
  const availableRules = form.capabilityId ? getRulesByCapability(form.capabilityId) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[600px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑权益规则" : "新建权益规则"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">定义能力+额度+周期+策略，连接应用与能力的计量配置</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">规则名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" placeholder="如：AI设计额度300次/日" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">规则编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
            <select className="filter-input w-full" value={form.appId} onChange={(e) => {
              const app = appData.find((a) => a.id === e.target.value);
              setForm({ ...form, appId: e.target.value, appName: app?.name || "", capabilityId: "", capabilityName: "", meteringRuleId: "", meteringRuleName: "" });
            }}>
              {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">关联能力 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.capabilityId} onChange={(e) => {
                const cap = capabilityData.find((c) => c.id === e.target.value);
                setForm({ ...form, capabilityId: e.target.value, capabilityName: cap?.name || "", meteringRuleId: "", meteringRuleName: "" });
              }}>
                <option value="">请选择能力</option>
                {availableCaps.map((c) => <option key={c.id} value={c.id}>{c.name}（{c.code}）</option>)}
              </select>
              {availableCaps.length === 0 && <p className="text-[11px] text-destructive">该应用下暂无关联能力</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">计量规则 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.meteringRuleId} onChange={(e) => {
                const rule = meteringRuleData.find((r) => r.id === e.target.value);
                setForm({ ...form, meteringRuleId: e.target.value, meteringRuleName: rule?.name || "" });
              }}>
                <option value="">请选择计量规则</option>
                {availableRules.map((r) => <option key={r.id} value={r.id}>{r.name}（{r.unit}）</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">额度 <span className="text-destructive">*</span></label>
              <input type="number" className="filter-input w-full" value={form.quota} onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">周期</label>
              <select className="filter-input w-full" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as PeriodType })}>
                {PERIOD_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">有效期（天）</label>
              <input type="number" className="filter-input w-full" value={form.validDays} onChange={(e) => setForm({ ...form, validDays: Number(e.target.value) })} />
              <p className="text-[11px] text-muted-foreground/70">0=永久</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim() || !form.capabilityId || !form.meteringRuleId} onClick={() => onSave(form)}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}

export default function RuleList() {
  const navigate = useNavigate();
  const [data, setData] = useState<EntitlementProduct[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EntitlementProduct | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("权益规则已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, status: "active", createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("权益规则已创建");
    }
    setDialogOpen(false); setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: EntitlementProduct) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    toast.success(item.status === "active" ? "已停用" : "已启用");
  }, []);

  const columns: TableColumn<EntitlementProduct>[] = [
    { key: "name", title: "规则名称", minWidth: 160, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/rule/detail/${(row as EntitlementProduct).id}`)}>{v}</button> },
    { key: "appName", title: "所属应用", minWidth: 130, render: (v, row) => <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors" onClick={() => navigate(`/entitlement/app/detail/${(row as EntitlementProduct).appId}`)}>{v}</button> },
    { key: "capabilityName", title: "关联能力", minWidth: 100, render: (v, row) => <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => navigate(`/entitlement/capability/detail/${(row as EntitlementProduct).capabilityId}`)}>{v}</button> },
    { key: "meteringRuleName", title: "计量规则", minWidth: 100, render: (v) => <span className="text-[12px] text-muted-foreground">{v}</span> },
    { key: "quota", title: "额度", minWidth: 70, align: "right" as const, render: (v) => <span className="font-medium text-foreground">{v.toLocaleString()}</span> },
    { key: "period", title: "周期", minWidth: 60, render: (v: string) => <span>{PERIOD_TYPES.find((p) => p.value === v)?.label || v}</span> },
    { key: "validDays", title: "有效期", minWidth: 60, render: (v: number) => <span className="text-muted-foreground">{v > 0 ? `${v}天` : "永久"}</span> },
    {
      key: "id", title: "引用商品", minWidth: 80, align: "center" as const,
      render: (_v, row) => {
        const count = getSkuRefCount((row as EntitlementProduct).id);
        return <span className={count > 0 ? "text-primary font-medium" : "text-muted-foreground"}>{count}</span>;
      },
    },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
  ];

  const actions: ActionItem<EntitlementProduct>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/rule/detail/${r.id}`) },
    { label: "查看引用", onClick: (r) => navigate(`/entitlement/rule/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => {
      if (getSkuRefCount(r.id) > 0) { toast.error("被商品引用的规则不能删除，只能停用"); return; }
      setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除");
    }},
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="权益规则管理" subtitle="定义能力+额度+周期+策略，是商品SKU的基础配置单元" actions={
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
          <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
        </div>
      } />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={4} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}><Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} /></div>
      <RuleDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
