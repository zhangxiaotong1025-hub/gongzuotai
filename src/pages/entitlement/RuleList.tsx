import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X } from "lucide-react";
import { ruleData as initialData, capabilityData, appData, skuData, PERIOD_TYPES, GRANT_TYPES, EXPIRE_POLICIES, STATUS_MAP, DATA_TYPES, type EntitlementRule, type PeriodType, type GrantType, type ExpirePolicy, getCapability, getCapabilitiesByApp, getSkusByRule } from "@/data/entitlement";

const filterFields: FilterField[] = [
  { key: "name", label: "规则名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "capabilityId", label: "关联能力", type: "select", options: capabilityData.map((c) => ({ label: c.name, value: c.id })), width: 140 },
  { key: "grantType", label: "发放方式", type: "select", options: GRANT_TYPES.map((g) => ({ label: g.label, value: g.value })), width: 120 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 100 },
];

function RuleDialog({ open, onClose, onSave, initial }: { open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: EntitlementRule | null }) {
  const initCap = initial ? getCapability(initial.capabilityId) : null;
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "",
    appId: initCap?.appId || appData[0]?.id,
    capabilityId: initial?.capabilityId || "",
    quota: initial?.quota ?? 100,
    periodType: (initial?.periodType || "DAY") as PeriodType,
    periodValue: initial?.periodValue ?? 1,
    grantType: (initial?.grantType || "DAILY_REFRESH") as GrantType,
    isCumulative: initial?.isCumulative ?? false,
    expirePolicy: (initial?.expirePolicy || "CLEAR_ON_EXPIRE") as ExpirePolicy,
    description: initial?.description || "",
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  const availableCaps = getCapabilitiesByApp(form.appId).filter((c) => c.status === "active");
  const selectedCap = capabilityData.find((c) => c.id === form.capabilityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[600px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑权益规则" : "新建权益规则"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">定义额度、周期、刷新策略，是运营可配置的核心层</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">规则名称 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full" placeholder="如：AI设计100次/日" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">规则编码 <span className="text-destructive">*</span></label>
              <input className="filter-input w-full font-mono" placeholder="RULE_开头" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={isEdit} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">所属应用 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.appId} onChange={(e) => setForm({ ...form, appId: e.target.value, capabilityId: "" })}>
                {appData.filter((a) => a.status === "active").map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">关联能力 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.capabilityId} onChange={(e) => setForm({ ...form, capabilityId: e.target.value })}>
                <option value="">请选择能力</option>
                {availableCaps.map((c) => <option key={c.id} value={c.id}>{c.name}（{c.code}·{c.unit}）</option>)}
              </select>
              {availableCaps.length === 0 && <p className="text-[11px] text-destructive">该应用下暂无能力</p>}
            </div>
          </div>
          {selectedCap && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 text-[12px]">
              <span className="text-muted-foreground">能力信息：</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{DATA_TYPES.find((t) => t.value === selectedCap.dataType)?.label.split("（")[0]}</span>
              <span>单位: {selectedCap.unit}</span>
              <span>默认消耗: {selectedCap.consumePerUse}</span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">额度数量 <span className="text-destructive">*</span></label>
              <input type="number" className="filter-input w-full" value={form.quota} onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">周期类型</label>
              <select className="filter-input w-full" value={form.periodType} onChange={(e) => {
                const pt = e.target.value as PeriodType;
                setForm({ ...form, periodType: pt, periodValue: pt === "PERMANENT" ? 0 : 1 });
              }}>
                {PERIOD_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">周期值</label>
              <input type="number" className="filter-input w-full" value={form.periodValue} onChange={(e) => setForm({ ...form, periodValue: Number(e.target.value) })} disabled={form.periodType === "PERMANENT"} />
              <p className="text-[11px] text-muted-foreground/70">永久为0</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">发放方式 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.grantType} onChange={(e) => setForm({ ...form, grantType: e.target.value as GrantType })}>
                {GRANT_TYPES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">是否累积</label>
              <select className="filter-input w-full" value={form.isCumulative ? "true" : "false"} onChange={(e) => setForm({ ...form, isCumulative: e.target.value === "true" })}>
                <option value="false">否</option>
                <option value="true">是</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">过期策略</label>
              <select className="filter-input w-full" value={form.expirePolicy} onChange={(e) => setForm({ ...form, expirePolicy: e.target.value as ExpirePolicy })}>
                {EXPIRE_POLICIES.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t">
          <button className="btn-secondary flex-1" onClick={onClose}>取消</button>
          <button className="btn-primary flex-1" disabled={!form.name.trim() || !form.code.trim() || !form.capabilityId} onClick={() => onSave(form)}>{isEdit ? "保存" : "创建"}</button>
        </div>
      </div>
    </div>
  );
}

export default function RuleList() {
  const navigate = useNavigate();
  const [data, setData] = useState<EntitlementRule[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EntitlementRule | null>(null);

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

  const toggleStatus = useCallback((item: EntitlementRule) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    toast.success(item.status === "active" ? "已停用" : "已启用");
  }, []);

  const columns: TableColumn<EntitlementRule>[] = [
    { key: "name", title: "规则名称", minWidth: 160, render: (v, row) => <button className="text-foreground font-medium hover:text-primary transition-colors" onClick={() => navigate(`/entitlement/rule/detail/${(row as EntitlementRule).id}`)}>{v}</button> },
    { key: "capabilityId", title: "关联能力", minWidth: 100, render: (v: string) => { const cap = getCapability(v); return cap ? <button className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground hover:bg-muted/80" onClick={() => navigate(`/entitlement/capability/detail/${v}`)}>{cap.name}</button> : <span>—</span>; } },
    { key: "quota", title: "额度", minWidth: 80, align: "right" as const, render: (v: number, row) => { const cap = getCapability((row as EntitlementRule).capabilityId); return <span className="font-medium text-foreground">{v.toLocaleString()}{cap ? ` ${cap.unit}` : ""}</span>; } },
    { key: "periodType", title: "周期", minWidth: 60, render: (v: string) => <span>{PERIOD_TYPES.find((p) => p.value === v)?.label || v}</span> },
    { key: "grantType", title: "发放方式", minWidth: 80, render: (v: string) => <span className="text-[12px] text-muted-foreground">{GRANT_TYPES.find((g) => g.value === v)?.label}</span> },
    { key: "isCumulative", title: "累积", minWidth: 50, align: "center" as const, render: (v: boolean) => v ? <span className="text-primary font-medium">是</span> : <span className="text-muted-foreground">否</span> },
    { key: "expirePolicy", title: "过期策略", minWidth: 80, render: (v: string) => <span className="text-[12px] text-muted-foreground">{EXPIRE_POLICIES.find((e) => e.value === v)?.label}</span> },
    {
      key: "id", title: "引用SKU", minWidth: 70, align: "center" as const,
      render: (_v, row) => {
        const count = getSkusByRule((row as EntitlementRule).id).length;
        return <span className={count > 0 ? "text-primary font-medium" : "text-muted-foreground"}>{count}</span>;
      },
    },
    { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
  ];

  const actions: ActionItem<EntitlementRule>[] = [
    { label: "查看", onClick: (r) => navigate(`/entitlement/rule/detail/${r.id}`) },
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: toggleStatus },
    { label: "删除", danger: true, onClick: (r) => {
      if (getSkusByRule(r.id).length > 0) { toast.error("被商品引用的规则不能删除"); return; }
      setData((p) => p.filter((a) => a.id !== r.id)); toast.success("已删除");
    }},
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="权益规则管理" subtitle="定义额度、周期、刷新策略，是运营可配置的核心层" actions={
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
