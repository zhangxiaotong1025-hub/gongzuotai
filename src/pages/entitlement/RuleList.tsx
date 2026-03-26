import { useState, useCallback } from "react";
import { AdminTable, type TableColumn, type ActionItem } from "@/components/admin/AdminTable";
import { FilterBar, type FilterField } from "@/components/admin/FilterBar";
import { Pagination } from "@/components/admin/Pagination";
import { PageHeader } from "@/components/admin/PageHeader";
import { toast } from "sonner";
import { Plus, Download, X } from "lucide-react";

/* ── Types ── */
interface Rule {
  id: string;
  name: string;
  code: string;
  capabilityName: string;
  quota: number;
  periodType: string;
  periodValue: number;
  grantType: string;
  isCumulative: boolean;
  expirePolicy: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
}

/* ── Constants ── */
const PERIOD_TYPES = [
  { value: "DAY", label: "天" },
  { value: "MONTH", label: "月" },
  { value: "YEAR", label: "年" },
  { value: "PERMANENT", label: "永久" },
];
const GRANT_TYPES = [
  { value: "DAILY_REFRESH", label: "每日刷新" },
  { value: "MONTHLY_GRANT", label: "每月发放" },
  { value: "ONE_TIME", label: "一次性" },
];
const EXPIRE_POLICIES = [
  { value: "CLEAR_ON_EXPIRE", label: "到期清零" },
  { value: "NEVER_EXPIRE", label: "不过期" },
];
const CAPABILITIES = ["AI设计", "4K渲染", "8K渲染", "全景图导出", "2D效果图导出", "云存储", "素材库"];

/* ── Mock ── */
const initialData: Rule[] = [
  { id: "1", name: "AI设计100次/日", code: "RULE_AI_100_DAY", capabilityName: "AI设计", quota: 100, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新100次AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "2", name: "AI设计300次/日", code: "RULE_AI_300_DAY", capabilityName: "AI设计", quota: 300, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新300次AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "3", name: "AI设计500次/日", code: "RULE_AI_500_DAY", capabilityName: "AI设计", quota: 500, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "每日刷新500次AI设计额度", status: "active", createdAt: "2026-03-10" },
  { id: "4", name: "4K渲染2次/日", code: "RULE_4K_2_DAY", capabilityName: "4K渲染", quota: 2, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "5", name: "4K渲染4次/日", code: "RULE_4K_4_DAY", capabilityName: "4K渲染", quota: 4, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "6", name: "8K渲染1次/日", code: "RULE_8K_1_DAY", capabilityName: "8K渲染", quota: 1, periodType: "DAY", periodValue: 1, grantType: "DAILY_REFRESH", isCumulative: false, expirePolicy: "CLEAR_ON_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "7", name: "云存储200MB", code: "RULE_STORAGE_200MB", capabilityName: "云存储", quota: 200, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "8", name: "云存储4GB", code: "RULE_STORAGE_4GB", capabilityName: "云存储", quota: 4096, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "", status: "active", createdAt: "2026-03-10" },
  { id: "9", name: "4K渲染1次", code: "RULE_4K_1_ONCE", capabilityName: "4K渲染", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: true, expirePolicy: "NEVER_EXPIRE", description: "充值类，可累积", status: "active", createdAt: "2026-03-11" },
  { id: "10", name: "素材库访问", code: "RULE_MATERIAL_ACCESS", capabilityName: "素材库", quota: 1, periodType: "PERMANENT", periodValue: 0, grantType: "ONE_TIME", isCumulative: false, expirePolicy: "NEVER_EXPIRE", description: "", status: "active", createdAt: "2026-03-11" },
];

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: { label: "启用", className: "badge-active" },
  inactive: { label: "停用", className: "badge-inactive" },
};

const filterFields: FilterField[] = [
  { key: "name", label: "规则名称/编码", type: "input", placeholder: "请输入", width: 200 },
  { key: "capability", label: "关联能力", type: "select", options: CAPABILITIES.map((c) => ({ label: c, value: c })), width: 140 },
  { key: "grantType", label: "发放方式", type: "select", options: GRANT_TYPES, width: 130 },
  { key: "status", label: "状态", type: "select", options: [{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }], width: 100 },
];

const columns: TableColumn<Rule>[] = [
  { key: "name", title: "规则名称", minWidth: 160, render: (v) => <span className="text-foreground font-medium">{v}</span> },
  { key: "code", title: "规则编码", minWidth: 160, render: (v) => <code className="text-[12px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{v}</code> },
  { key: "capabilityName", title: "关联能力", minWidth: 100, render: (v) => <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{v}</span> },
  { key: "quota", title: "额度", minWidth: 70, align: "right" as const, render: (v) => <span className="font-medium text-foreground">{v.toLocaleString()}</span> },
  { key: "periodType", title: "周期", minWidth: 60, render: (v: string) => <span>{PERIOD_TYPES.find((p) => p.value === v)?.label || v}</span> },
  { key: "grantType", title: "发放方式", minWidth: 90, render: (v: string) => <span className="text-[12px]">{GRANT_TYPES.find((g) => g.value === v)?.label || v}</span> },
  { key: "isCumulative", title: "可累积", minWidth: 60, align: "center" as const, render: (v: boolean) => <span className={v ? "text-primary text-[12px] font-medium" : "text-muted-foreground text-[12px]"}>{v ? "是" : "否"}</span> },
  { key: "expirePolicy", title: "过期策略", minWidth: 80, render: (v: string) => <span className="text-[12px]">{EXPIRE_POLICIES.find((e) => e.value === v)?.label || v}</span> },
  { key: "status", title: "状态", minWidth: 80, render: (v: string) => { const cfg = STATUS_MAP[v]; return <span className={cfg.className}>{cfg.label}</span>; } },
  { key: "createdAt", title: "创建时间", minWidth: 110, render: (v) => <span className="text-muted-foreground">{v}</span> },
];

/* ── Dialog ── */
function RuleDialog({ open, onClose, onSave, initial }: {
  open: boolean; onClose: () => void; onSave: (d: any) => void; initial?: Rule | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name || "", code: initial?.code || "", capabilityName: initial?.capabilityName || CAPABILITIES[0],
    quota: initial?.quota || 100, periodType: initial?.periodType || "DAY", periodValue: initial?.periodValue ?? 1,
    grantType: initial?.grantType || "DAILY_REFRESH", isCumulative: initial?.isCumulative || false,
    expirePolicy: initial?.expirePolicy || "CLEAR_ON_EXPIRE", description: initial?.description || "",
  });
  const isEdit = Boolean(initial);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[600px] rounded-xl border bg-card p-0 animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
        <div className="border-b bg-muted/40 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">{isEdit ? "编辑权益规则" : "新建权益规则"}</h3>
            <p className="mt-0.5 text-[13px] text-muted-foreground">定义额度、周期和发放策略，规则名称不带业务标签</p>
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
              <label className="text-[13px] text-muted-foreground">关联能力 <span className="text-destructive">*</span></label>
              <select className="filter-input w-full" value={form.capabilityName} onChange={(e) => setForm({ ...form, capabilityName: e.target.value })}>
                {CAPABILITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">额度数量 <span className="text-destructive">*</span></label>
              <input type="number" className="filter-input w-full" value={form.quota} onChange={(e) => setForm({ ...form, quota: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">周期类型</label>
              <select className="filter-input w-full" value={form.periodType} onChange={(e) => setForm({ ...form, periodType: e.target.value })}>
                {PERIOD_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">发放方式</label>
              <select className="filter-input w-full" value={form.grantType} onChange={(e) => setForm({ ...form, grantType: e.target.value })}>
                {GRANT_TYPES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] text-muted-foreground">过期策略</label>
              <select className="filter-input w-full" value={form.expirePolicy} onChange={(e) => setForm({ ...form, expirePolicy: e.target.value })}>
                {EXPIRE_POLICIES.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-[13px] text-muted-foreground">是否可累积</label>
            <button className={`w-10 h-5 rounded-full transition-colors ${form.isCumulative ? "bg-primary" : "bg-muted-foreground/30"}`} onClick={() => setForm({ ...form, isCumulative: !form.isCumulative })}>
              <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isCumulative ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <span className="text-[12px] text-muted-foreground">{form.isCumulative ? "多次购买可累积" : "不累积"}</span>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] text-muted-foreground">规则描述</label>
            <textarea className="filter-input w-full min-h-[50px] resize-y" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
export default function RuleList() {
  const [data, setData] = useState<Rule[]>(initialData);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Rule | null>(null);

  const handleSave = useCallback((form: any) => {
    if (editTarget) {
      setData((prev) => prev.map((a) => a.id === editTarget.id ? { ...a, ...form } : a));
      toast.success("规则已更新");
    } else {
      setData((prev) => [{ id: String(Date.now()), ...form, status: "active", createdAt: new Date().toLocaleDateString("zh-CN") }, ...prev]);
      toast.success("规则已创建");
    }
    setDialogOpen(false);
    setEditTarget(null);
  }, [editTarget]);

  const toggleStatus = useCallback((item: Rule) => {
    setData((prev) => prev.map((a) => a.id === item.id ? { ...a, status: a.status === "active" ? "inactive" : "active" } : a));
    toast.success(item.status === "active" ? "已停用" : "已启用");
  }, []);

  const actions: ActionItem<Rule>[] = [
    { label: "编辑", onClick: (r) => { setEditTarget(r); setDialogOpen(true); } },
    { label: (r) => r.status === "active" ? "停用" : "启用", onClick: toggleStatus },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="权益规则"
        subtitle="定义额度、周期和发放策略，规则名称不带业务标签"
        actions={
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => { setEditTarget(null); setDialogOpen(true); }}><Plus className="h-4 w-4" /> 新建</button>
            <button className="btn-secondary"><Download className="h-4 w-4" /> 导出</button>
          </div>
        }
      />
      <FilterBar fields={filterFields} values={filters} onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))} onSearch={() => {}} onReset={() => setFilters({})} maxVisible={4} />
      <AdminTable columns={columns} data={data} rowKey={(r) => r.id} actions={actions} maxVisibleActions={2} />
      <div className="bg-card rounded-xl border" style={{ boxShadow: "var(--shadow-xs)" }}>
        <Pagination current={currentPage} total={data.length} pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }} />
      </div>
      <RuleDialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditTarget(null); }} onSave={handleSave} initial={editTarget} />
    </div>
  );
}
